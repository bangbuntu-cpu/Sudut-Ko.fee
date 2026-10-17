import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, nama: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateMemberStatus: (nama: string, noHp: string, alamat: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'sudutkofee_user_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email?: string | null;
    displayName?: string | null;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync Firebase Auth user and Firestore user profile
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              const emailLower = (user.email || '').toLowerCase();
              const isAdminEmail =
                emailLower === 'bangbuntu@gmail.com' ||
                emailLower === 'admin@sudutkofee.com' ||
                emailLower.startsWith('admin@') ||
                data.role === 'admin';

              if (isAdminEmail && data.role !== 'admin') {
                await setDoc(userDocRef, { ...data, role: 'admin' }, { merge: true });
                await setDoc(doc(db, 'admins', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  role: 'admin'
                });
                const updated = { ...data, role: 'admin' as UserRole };
                setUserProfile(updated);
                localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
              } else {
                setUserProfile(data);
                localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data));
              }
            } else {
              const emailLower = (user.email || '').toLowerCase();
              const isAdminEmail =
                emailLower === 'bangbuntu@gmail.com' ||
                emailLower === 'admin@sudutkofee.com' ||
                emailLower.startsWith('admin@');

              if (!isAdminEmail) {
                await signOut(auth).catch(() => {});
                setCurrentUser(null);
                setUserProfile(null);
                localStorage.removeItem(USER_SESSION_KEY);
                setLoading(false);
                return;
              }

              const initialProfile: UserProfile = {
                uid: user.uid,
                nama: 'Admin SUDUT KO.FEE',
                email: user.email || '',
                role: 'admin',
                isMember: false,
                poin: 0,
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, initialProfile);
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin'
              });
              setUserProfile(initialProfile);
              localStorage.setItem(USER_SESSION_KEY, JSON.stringify(initialProfile));
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user profile:', error);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeProfile) unsubscribeProfile();

        // Check if session stored locally
        const savedSession = localStorage.getItem(USER_SESSION_KEY);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession) as UserProfile;
            setCurrentUser({
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.nama
            });
            setUserProfile(parsed);

            // Keep Firestore synchronized with profile
            const profileRef = doc(db, 'users', parsed.uid);
            unsubscribeProfile = onSnapshot(profileRef, (snap) => {
              if (snap.exists()) {
                const fresh = snap.data() as UserProfile;
                setUserProfile(fresh);
                localStorage.setItem(USER_SESSION_KEY, JSON.stringify(fresh));
              }
            });
          } catch {
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithEmail = async (emailInput: string, pass: string) => {
    const email = emailInput.trim().toLowerCase();
    const isAdminEmail =
      email === 'admin@sudutkofee.com' ||
      email === 'bangbuntu@gmail.com' ||
      email.startsWith('admin@');

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() && !isAdminEmail) {
        await signOut(auth).catch(() => {});
        throw new Error('Akun tidak terdaftar di database. Silakan daftar (register) terlebih dahulu.');
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
        const uid = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() && !isAdminEmail) {
          throw new Error('Akun tidak terdaftar di database. Silakan daftar (register) terlebih dahulu.');
        }

        let profile: UserProfile;
        if (userSnap.exists()) {
          profile = userSnap.data() as UserProfile;
          if (isAdminEmail && profile.role !== 'admin') {
            profile.role = 'admin';
            await setDoc(userRef, { role: 'admin' }, { merge: true });
          }
        } else {
          profile = {
            uid,
            nama: 'Admin SUDUT KO.FEE',
            email,
            role: 'admin',
            isMember: false,
            poin: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, profile);
          await setDoc(doc(db, 'admins', uid), { uid, email, role: 'admin' });
        }

        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        setCurrentUser({ uid: profile.uid, email: profile.email, displayName: profile.nama });
        setUserProfile(profile);
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (emailInput: string, pass: string, namaInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const nama = namaInput.trim();
    const isAdminEmail =
      email === 'admin@sudutkofee.com' ||
      email === 'bangbuntu@gmail.com' ||
      email.startsWith('admin@');

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        nama: nama || email.split('@')[0],
        email,
        role: isAdminEmail ? 'admin' : 'user',
        isMember: false,
        poin: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      if (isAdminEmail) {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          uid: cred.user.uid,
          email,
          role: 'admin'
        });
      }
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newProfile));
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
        const uid = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
        const newProfile: UserProfile = {
          uid,
          nama: nama || (isAdminEmail ? 'Admin SUDUT KO.FEE' : email.split('@')[0]),
          email,
          role: isAdminEmail ? 'admin' : 'user',
          isMember: false,
          poin: 0,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', uid), newProfile);
        if (isAdminEmail) {
          await setDoc(doc(db, 'admins', uid), { uid, email, role: 'admin' });
        }
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newProfile));
        setCurrentUser({ uid: newProfile.uid, email: newProfile.email, displayName: newProfile.nama });
        setUserProfile(newProfile);
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    const emailLower = (user.email || '').toLowerCase();
    const isAdminEmail =
      emailLower === 'bangbuntu@gmail.com' ||
      emailLower === 'admin@sudutkofee.com' ||
      emailLower.startsWith('admin@');

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() && !isAdminEmail) {
      await signOut(auth).catch(() => {});
      throw new Error('Akun Google ini tidak terdaftar di database. Silakan daftar (register) terlebih dahulu.');
    }
  };

  const logout = async () => {
    localStorage.removeItem(USER_SESSION_KEY);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateMemberStatus = async (nama: string, noHp: string, alamat: string) => {
    if (!currentUser) throw new Error('Pengguna belum masuk');
    const updated = {
      nama,
      noHp,
      alamat,
      isMember: true
    };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userRef, updated, { merge: true });
    } catch (e) {
      console.warn('Firestore updateMemberStatus:', e);
    }

    setUserProfile((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const userEmailLower = (currentUser?.email || '').toLowerCase();
  const isAdmin =
    userProfile?.role === 'admin' ||
    userEmailLower === 'admin@sudutkofee.com' ||
    userEmailLower === 'bangbuntu@gmail.com' ||
    userEmailLower.startsWith('admin@');

  const isMember = Boolean(userProfile?.isMember);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isMember,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateMemberStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
