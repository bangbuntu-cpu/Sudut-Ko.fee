import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  ADMIN_EMAIL,
  ADMIN_DEFAULT_PASS,
  ADMIN_UID,
  DEFAULT_ADMIN_PROFILE,
  DEFAULT_ADMIN_CREDENTIAL,
  findUserByEmail,
  getCredentialForUser,
  saveCredentialForUser,
  createUserProfile,
  registerAsMember,
  subscribeAllUsers
} from '../services/dbService';

interface AuthContextType {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, confirmPass: string, nama: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMemberStatus: (nama: string, noHp: string, alamat: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'sudutkofee_user_session_v1';

/**
 * Computes a secure SHA-256 cryptographic hash using Web Crypto API.
 * Never stores plaintext passwords in the database or spreadsheet!
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email?: string | null;
    displayName?: string | null;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.uid) {
          return {
            uid: parsed.uid,
            email: parsed.email || null,
            displayName: parsed.nama || parsed.displayName || null
          };
        }
      }
      return null;
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

  // Hydrate user session from storage and subscribe to real-time user updates
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(USER_SESSION_KEY);
      if (savedStr) {
        const savedData = JSON.parse(savedStr);
        if (savedData?.uid) {
          // If admin, verify admin default
          if (savedData.email === ADMIN_EMAIL || savedData.role === 'admin') {
            setCurrentUser({
              uid: ADMIN_UID,
              email: ADMIN_EMAIL,
              displayName: DEFAULT_ADMIN_PROFILE.nama
            });
            setUserProfile(DEFAULT_ADMIN_PROFILE);
          } else {
            setCurrentUser({
              uid: savedData.uid,
              email: savedData.email || null,
              displayName: savedData.nama || savedData.displayName || null
            });
            setUserProfile(savedData);
          }
        }
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    } finally {
      setLoading(false);
    }

    // Subscribe to user list changes to keep logged in user's profile and points up to date
    const unsubUsers = subscribeAllUsers((allUsers) => {
      setCurrentUser((current) => {
        if (!current) return null;
        const matching = allUsers.find((u) => u.uid === current.uid || u.email === current.email);
        if (matching) {
          setUserProfile(matching);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(matching));
        }
        return current;
      });
    });

    return () => {
      unsubUsers();
    };
  }, []);

  const loginWithEmail = async (emailInput: string, pass: string) => {
    const email = emailInput.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!email || !cleanPass) {
      throw new Error('Email dan kata sandi wajib diisi.');
    }

    // 1. ADMIN LOGIN SPECIAL HANDLING
    if (email === ADMIN_EMAIL) {
      if (cleanPass !== ADMIN_DEFAULT_PASS) {
        throw new Error('Email atau password salah.');
      }

      const sessionObj = {
        uid: ADMIN_UID,
        email: ADMIN_EMAIL,
        displayName: DEFAULT_ADMIN_PROFILE.nama
      };

      setCurrentUser(sessionObj);
      setUserProfile(DEFAULT_ADMIN_PROFILE);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(DEFAULT_ADMIN_PROFILE));
      return;
    }

    // 2. STANDARD USER LOGIN
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('Akun belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu.');
    }

    // Verify password against stored hash
    const cred = await getCredentialForUser(user.uid);
    if (cred) {
      const inputHash = await hashPassword(cleanPass, cred.salt);
      if (inputHash !== cred.passwordHash) {
        throw new Error('Email atau password salah.');
      }
    } else {
      // Legacy user without credentials yet: securely lock this password now
      const salt = generateSalt();
      const passwordHash = await hashPassword(cleanPass, salt);
      await saveCredentialForUser({
        uid: user.uid,
        email: user.email,
        salt,
        passwordHash
      });
    }

    const sessionObj = {
      uid: user.uid,
      email: user.email,
      displayName: user.nama
    };

    setCurrentUser(sessionObj);
    setUserProfile(user);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  };

  const registerWithEmail = async (
    emailInput: string,
    pass: string,
    confirmPass: string,
    namaInput: string
  ) => {
    const email = emailInput.trim().toLowerCase();
    const nama = namaInput.trim();
    const cleanPass = pass.trim();
    const cleanConfirm = confirmPass.trim();

    // 1. Validations
    if (!nama) {
      throw new Error('Nama lengkap wajib diisi.');
    }

    if (!email) {
      throw new Error('Alamat email wajib diisi.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email tidak valid. Gunakan format contoh@domain.com.');
    }

    if (cleanPass.length < 6) {
      throw new Error('Password minimal 6 karakter.');
    }

    if (cleanPass !== cleanConfirm) {
      throw new Error('Konfirmasi password tidak cocok dengan password.');
    }

    // Admin email cannot be registered through public registration
    if (email === ADMIN_EMAIL) {
      throw new Error('Email ini telah terdaftar sebagai akun Administrator. Silakan masuk di halaman login.');
    }

    // 2. Enforce unique email check
    const existing = await findUserByEmail(email);
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan masuk menggunakan akun Anda.');
    }

    // 3. Generate unique user UID and cryptographic password hash
    const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const salt = generateSalt();
    const passwordHash = await hashPassword(cleanPass, salt);

    // 4. Store user in Spreadsheet database
    // STRICT REQUIREMENT: Public registration ALWAYS has role "user".
    // NEVER store plaintext password in database!
    const newProfile: UserProfile = {
      uid,
      nama,
      email,
      role: 'user',
      isMember: false,
      poin: 0,
      createdAt: new Date().toISOString()
    };

    await createUserProfile(newProfile);

    // Store credentials securely (only salt and hash)
    await saveCredentialForUser({
      uid,
      email,
      salt,
      passwordHash
    });

    const sessionObj = {
      uid,
      email,
      displayName: nama
    };

    setCurrentUser(sessionObj);
    setUserProfile(newProfile);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newProfile));
  };

  const logout = async () => {
    localStorage.removeItem(USER_SESSION_KEY);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateMemberStatus = async (nama: string, noHp: string, alamat: string) => {
    if (!currentUser) throw new Error('Pengguna belum masuk');

    await registerAsMember(currentUser.uid, { nama, noHp, alamat });

    setUserProfile((prev) => {
      if (!prev) return null;
      const next: UserProfile = { ...prev, nama, noHp, alamat, isMember: true };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const userEmailLower = (currentUser?.email || '').toLowerCase();
  const isAdmin =
    userProfile?.role === 'admin' ||
    userEmailLower === ADMIN_EMAIL;

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
