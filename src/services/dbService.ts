import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import {
  UserProfile,
  Product,
  Reward,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PointHistory,
  Redemption,
  StoreSettings
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_REWARDS, DEFAULT_SETTINGS } from './seedData';

// ==================== SETTINGS ====================
export async function getStoreSettings(): Promise<StoreSettings> {
  const path = 'settings/general';
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    } else {
      // Initialize with default
      await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeStoreSettings(callback: (settings: StoreSettings) => void): () => void {
  const path = 'settings/general';
  return onSnapshot(
    doc(db, 'settings', 'general'),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as StoreSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), newSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== USERS & MEMBERS ====================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
    // If user is admin, also record in admins collection for fast rule checks
    if (profile.role === 'admin') {
      await setDoc(doc(db, 'admins', profile.uid), {
        uid: profile.uid,
        email: profile.email,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function registerAsMember(
  uid: string,
  memberData: { nama: string; noHp: string; alamat: string }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      nama: memberData.nama,
      noHp: memberData.noHp,
      alamat: memberData.alamat,
      isMember: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
    try {
      await deleteDoc(doc(db, 'admins', uid));
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeAllUsers(callback: (users: UserProfile[]) => void): () => void {
  const path = 'users';
  return onSnapshot(
    collection(db, 'users'),
    (snap) => {
      const users: UserProfile[] = [];
      snap.forEach((d) => {
        const u = d.data() as UserProfile;
        const idLower = d.id.toLowerCase();
        const emailLower = (u.email || '').toLowerCase();
        const nameLower = (u.nama || '').toLowerCase();
        const uidLower = (u.uid || '').toLowerCase();

        const isDemo =
          idLower.includes('demo') ||
          uidLower.includes('demo') ||
          emailLower.includes('demo') ||
          emailLower.includes('kopikita') ||
          emailLower.includes('test') ||
          emailLower.includes('dummy') ||
          nameLower.includes('demo') ||
          nameLower.includes('budi') ||
          nameLower.includes('santoso') ||
          nameLower.includes('kopi kita') ||
          nameLower.includes('test') ||
          nameLower.includes('dummy') ||
          nameLower.includes('contoh') ||
          nameLower.includes('sample');

        if (isDemo) {
          deleteDoc(doc(db, 'users', d.id)).catch(() => {});
          deleteDoc(doc(db, 'admins', d.id)).catch(() => {});
        } else {
          users.push(u);
        }
      });
      callback(users);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==================== PRODUCTS ====================
export function subscribeProducts(callback: (products: Product[]) => void): () => void {
  const path = 'products';
  return onSnapshot(
    collection(db, 'products'),
    (snap) => {
      const items: Product[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const path = 'products';
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    await updateDoc(doc(db, 'products', id), {
      ...product,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== REWARDS ====================
export function subscribeRewards(callback: (rewards: Reward[]) => void): () => void {
  const path = 'rewards';
  return onSnapshot(
    collection(db, 'rewards'),
    (snap) => {
      const items: Reward[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<Reward, 'id'>) }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addReward(reward: Omit<Reward, 'id'>): Promise<string> {
  const path = 'rewards';
  try {
    const docRef = await addDoc(collection(db, 'rewards'), {
      ...reward,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReward(id: string, reward: Partial<Reward>): Promise<void> {
  const path = `rewards/${id}`;
  try {
    await updateDoc(doc(db, 'rewards', id), reward);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReward(id: string): Promise<void> {
  const path = `rewards/${id}`;
  try {
    await deleteDoc(doc(db, 'rewards', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== ORDERS ====================
export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  const path = 'orders';
  try {
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  const path = 'orders';
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const orders: Order[] = [];
      snap.forEach((d) => orders.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      callback(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllOrders(callback: (orders: Order[]) => void): () => void {
  const path = 'orders';
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const orders: Order[] = [];
      snap.forEach((d) => {
        const o = { id: d.id, ...(d.data() as Omit<Order, 'id'>) };
        const idLower = d.id.toLowerCase();
        const uidLower = (o.userId || '').toLowerCase();
        const nameLower = (o.userName || '').toLowerCase();

        const isDemo =
          idLower.includes('demo') ||
          uidLower.includes('demo') ||
          nameLower.includes('demo') ||
          nameLower.includes('budi') ||
          nameLower.includes('santoso') ||
          nameLower.includes('kopi kita');

        if (isDemo) {
          deleteDoc(doc(db, 'orders', d.id)).catch(() => {});
        } else {
          orders.push(o);
        }
      });
      callback(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Updates order status.
 * CRITICAL BUSINESS RULE:
 * When status changes to "Selesai", points are awarded ONLY IF the customer is already a Member.
 * Points are calculated from total belanja based on store settings, and added to the user's balance and logged in pointHistory.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  try {
    await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Pesanan tidak ditemukan');
      }

      const orderData = orderSnap.data() as Order;
      const oldStatus = orderData.status;

      const needsUserRead = newStatus === 'Selesai' && oldStatus !== 'Selesai' && orderData.poinDidapat > 0;
      const userRef = needsUserRead ? doc(db, 'users', orderData.userId) : null;
      let userSnap: any = null;
      if (needsUserRead && userRef) {
        userSnap = await transaction.get(userRef);
      }

      // 2. ALL WRITES AFTER ALL READS
      transaction.update(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      if (needsUserRead && userRef && userSnap && userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        // Rule: Points are only awarded if customer is a Member!
        if (userData.isMember) {
          const currentPoints = userData.poin || 0;
          const newPoints = currentPoints + orderData.poinDidapat;

          transaction.update(userRef, { poin: newPoints });

          // Record point history
          const pointHistoryRef = doc(collection(db, 'pointHistory'));
          transaction.set(pointHistoryRef, {
            userId: orderData.userId,
            tipe: 'masuk',
            jumlah: orderData.poinDidapat,
            keterangan: `Poin belanja pesanan #${orderId.slice(0, 6)} (${orderData.sumber})`,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

/**
 * Input manual offline transaction for a member
 */
export async function inputManualOfflineOrder(params: {
  memberId: string;
  memberName: string;
  memberPhone?: string;
  items: OrderItem[];
  total: number;
  metodeBayar: PaymentMethod;
  catatan?: string;
  status: OrderStatus; // usually 'Selesai' directly for in-store
  poinDidapat: number;
}): Promise<string> {
  const path = 'orders';
  try {
    const orderData: Omit<Order, 'id'> = {
      userId: params.memberId,
      userName: params.memberName,
      userPhone: params.memberPhone || '',
      items: params.items,
      total: params.total,
      status: params.status,
      metodeBayar: params.metodeBayar,
      sumber: 'offline',
      poinDidapat: params.poinDidapat,
      catatan: params.catatan || 'Transaksi kasir / offline',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // If directly set to Selesai, process points right away
    if (params.status === 'Selesai' && params.poinDidapat > 0) {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', params.memberId);
        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          if (userData.isMember) {
            const newPoints = (userData.poin || 0) + params.poinDidapat;
            transaction.update(userRef, { poin: newPoints });

            const pointHistoryRef = doc(collection(db, 'pointHistory'));
            transaction.set(pointHistoryRef, {
              userId: params.memberId,
              tipe: 'masuk',
              jumlah: params.poinDidapat,
              keterangan: `Poin belanja offline #${docRef.id.slice(0, 6)}`,
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==================== POINT REDEMPTION ====================
/**
 * Redeem loyalty points for a reward.
 * CRITICAL BUSINESS RULE:
 * 1. Poin must be sufficient (userPoin >= reward.poinDibutuhkan).
 * 2. Poin can NEVER be negative.
 * 3. User points automatically deducted.
 * 4. Reward stock deducted.
 * 5. Recorded in redemptions and pointHistory.
 */
export async function redeemReward(
  userId: string,
  userName: string,
  reward: Reward
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const rewardRef = doc(db, 'rewards', reward.id);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const rewardSnap = await transaction.get(rewardRef);

      if (!userSnap.exists()) throw new Error('Pengguna tidak ditemukan.');
      if (!rewardSnap.exists()) throw new Error('Reward tidak ditemukan.');

      const userData = userSnap.data() as UserProfile;
      const currentReward = rewardSnap.data() as Reward;

      if (!userData.isMember) {
        throw new Error('Hanya akun dengan status Member yang dapat menukarkan poin.');
      }

      const userPoin = userData.poin || 0;
      if (userPoin < currentReward.poinDibutuhkan) {
        throw new Error(`Poin tidak mencukupi. Anda butuh ${currentReward.poinDibutuhkan} poin (Poin Anda: ${userPoin}).`);
      }

      if (currentReward.stok <= 0) {
        throw new Error('Maaf, stok hadiah reward ini sedang habis.');
      }

      const remainingPoin = userPoin - currentReward.poinDibutuhkan;
      if (remainingPoin < 0) {
        throw new Error('Poin tidak valid (poin tidak boleh bernilai negatif).');
      }

      // Deduct user points
      transaction.update(userRef, { poin: remainingPoin });

      // Deduct reward stock
      transaction.update(rewardRef, { stok: currentReward.stok - 1 });

      // Record point history
      const historyRef = doc(collection(db, 'pointHistory'));
      transaction.set(historyRef, {
        userId,
        tipe: 'keluar',
        jumlah: currentReward.poinDibutuhkan,
        keterangan: `Penukaran reward: ${currentReward.nama}`,
        createdAt: new Date().toISOString()
      });

      // Record redemption request
      const redemptionRef = doc(collection(db, 'redemptions'));
      transaction.set(redemptionRef, {
        userId,
        userName,
        rewardId: reward.id,
        namaReward: currentReward.nama,
        poinDipakai: currentReward.poinDibutuhkan,
        status: 'Selesai',
        createdAt: new Date().toISOString()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rewards/${reward.id}`);
  }
}

export function subscribeUserPointHistory(
  userId: string,
  callback: (history: PointHistory[]) => void
): () => void {
  const path = 'pointHistory';
  const q = query(
    collection(db, 'pointHistory'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: PointHistory[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<PointHistory, 'id'>) }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeUserRedemptions(
  userId: string,
  callback: (redemptions: Redemption[]) => void
): () => void {
  const path = 'redemptions';
  const q = query(
    collection(db, 'redemptions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: Redemption[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Redemption, 'id'>) }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllRedemptions(callback: (redemptions: Redemption[]) => void): () => void {
  const path = 'redemptions';
  const q = query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: Redemption[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Redemption, 'id'>) }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==================== SEED DATABASE ====================
export async function seedDatabaseIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      return { seeded: false, count: productsSnap.size };
    }

    // Seed products
    for (const prod of INITIAL_PRODUCTS) {
      await addDoc(collection(db, 'products'), {
        ...prod,
        createdAt: new Date().toISOString()
      });
    }

    // Seed rewards
    for (const rew of INITIAL_REWARDS) {
      await addDoc(collection(db, 'rewards'), {
        ...rew,
        createdAt: new Date().toISOString()
      });
    }

    // Seed settings
    await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);

    return { seeded: true, count: INITIAL_PRODUCTS.length };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { seeded: false, count: 0 };
  }
}

/**
 * Completely purges all demo accounts, demo members, demo orders, and demo point records
 * from Firestore to guarantee zero demo artifacts in the database.
 */
export async function cleanupAllDemoData(): Promise<{ deletedUsers: number; deletedOrders: number }> {
  let deletedUsers = 0;
  let deletedOrders = 0;
  try {
    // 1. Clean users collection
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const d of usersSnap.docs) {
      const u = d.data() as UserProfile;
      const idLower = d.id.toLowerCase();
      const emailLower = (u.email || '').toLowerCase();
      const nameLower = (u.nama || '').toLowerCase();
      const uidLower = (u.uid || '').toLowerCase();

      if (
        idLower.includes('demo') ||
        uidLower.includes('demo') ||
        emailLower.includes('demo') ||
        emailLower.includes('kopikita') ||
        emailLower.includes('test') ||
        emailLower.includes('dummy') ||
        nameLower.includes('demo') ||
        nameLower.includes('budi') ||
        nameLower.includes('santoso') ||
        nameLower.includes('kopi kita') ||
        nameLower.includes('test') ||
        nameLower.includes('dummy') ||
        nameLower.includes('contoh') ||
        nameLower.includes('sample')
      ) {
        await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
        await deleteDoc(doc(db, 'admins', d.id)).catch(() => {});
        deletedUsers++;
      }
    }

    // 2. Clean admins collection
    try {
      const adminsSnap = await getDocs(collection(db, 'admins'));
      for (const d of adminsSnap.docs) {
        const data = d.data() as { email?: string };
        const emailLower = (data.email || '').toLowerCase();
        if (
          d.id.toLowerCase().includes('demo') ||
          emailLower.includes('demo') ||
          emailLower.includes('kopikita')
        ) {
          await deleteDoc(doc(db, 'admins', d.id)).catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    // 3. Clean orders collection
    const ordersSnap = await getDocs(collection(db, 'orders'));
    for (const d of ordersSnap.docs) {
      const o = d.data() as Order;
      const idLower = d.id.toLowerCase();
      const uidLower = (o.userId || '').toLowerCase();
      const nameLower = (o.userName || '').toLowerCase();

      if (
        idLower.includes('demo') ||
        uidLower.includes('demo') ||
        nameLower.includes('demo') ||
        nameLower.includes('budi') ||
        nameLower.includes('santoso') ||
        nameLower.includes('kopi kita')
      ) {
        await deleteDoc(doc(db, 'orders', d.id)).catch(() => {});
        deletedOrders++;
      }
    }

    // 4. Clean point history
    try {
      const phSnap = await getDocs(collection(db, 'pointHistory'));
      for (const d of phSnap.docs) {
        const ph = d.data() as PointHistory;
        if (ph.userId?.toLowerCase().includes('demo')) {
          await deleteDoc(doc(db, 'pointHistory', d.id)).catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    // 5. Clean local storage demo sessions
    try {
      const saved = localStorage.getItem('sudutkofee_user_session_v1');
      if (saved && (saved.includes('demo') || saved.includes('kopikita') || saved.includes('budi'))) {
        localStorage.removeItem('sudutkofee_user_session_v1');
      }
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Error cleaning demo data:', err);
  }

  return { deletedUsers, deletedOrders };
}

