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

// Google Spreadsheet Configuration
export const SPREADSHEET_ID = '14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw';
export const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw/edit?usp=sharing';

// Permanent Google Apps Script Web App Deployment URL
export const PERMANENT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw7sDnzIh15Efg2OSeW123YqFJBqa_144QtEtR235YSUi5KKpPJQaOkA_jV-SPVorjB/exec';

const STORAGE_KEYS = {
  USERS: 'sudutkofee_sheet_users_v2',
  CREDS: 'sudutkofee_sheet_creds_v2',
  ORDERS: 'sudutkofee_sheet_orders_v2',
  PRODUCTS: 'sudutkofee_sheet_products_v2',
  REWARDS: 'sudutkofee_sheet_rewards_v2',
  POINT_HISTORY: 'sudutkofee_sheet_point_history_v2',
  REDEMPTIONS: 'sudutkofee_sheet_redemptions_v2',
  SETTINGS: 'sudutkofee_sheet_settings_v2',
  SCRIPT_URL: 'sudutkofee_sheet_api_url'
};

// Admin Fixed Credentials & Record
export const ADMIN_EMAIL = 'bangbuntu@gmail.com';
export const ADMIN_DEFAULT_PASS = 'Sby12345';
export const ADMIN_UID = 'user_YmFuZ2J1bnR1QGdtYWlsLmNv';

export const DEFAULT_ADMIN_PROFILE: UserProfile = {
  uid: ADMIN_UID,
  nama: 'Admin SUDUT KO.FEE',
  email: ADMIN_EMAIL,
  noHp: '+62 812-3456-7890',
  alamat: 'Ngoro, Mojokerto',
  role: 'admin',
  isMember: false,
  poin: 0,
  createdAt: '2026-10-17T08:35:34.964Z'
};

export const DEFAULT_ADMIN_CREDENTIAL = {
  uid: ADMIN_UID,
  email: ADMIN_EMAIL,
  salt: 'admin_salt_sudutkofee_v1',
  passwordHash: 'b0e062459b790d718496abf22840e39b0ddae96e4d1dc068b8ab7b56a52c9f4a', // SHA-256 of 'Sby12345'
  updatedAt: '2026-10-17T08:35:34.964Z'
};

// Event Listeners for Real-time Reactive UI Subscriptions
type ListenerCallback = () => void;
const listeners: { [key: string]: Set<ListenerCallback> } = {
  products: new Set(),
  rewards: new Set(),
  orders: new Set(),
  users: new Set(),
  settings: new Set(),
  pointHistory: new Set(),
  redemptions: new Set()
};

function notify(key: string) {
  if (listeners[key]) {
    listeners[key].forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(`Listener error for ${key}:`, e);
      }
    });
  }
}

// Memory Cache with Local Storage Persistence
function getStored<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save storage for ${key}:`, e);
  }
}

// In-Memory Database State backed by Spreadsheet structure
let cacheUsers: UserProfile[] = [];
let cacheCreds: Array<{ uid: string; email: string; salt: string; passwordHash: string; updatedAt: string }> = [];
let cacheOrders: Order[] = [];
let cacheProducts: Product[] = [];
let cacheRewards: Reward[] = [];
let cachePointHistory: PointHistory[] = [];
let cacheRedemptions: Redemption[] = [];
let cacheSettings: StoreSettings = DEFAULT_SETTINGS;

function initDatabaseState() {
  cacheSettings = getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const storedProducts = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (storedProducts.length === 0) {
    cacheProducts = INITIAL_PRODUCTS.map((p, idx) => ({
      id: `prod_${idx + 1}`,
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
  } else {
    cacheProducts = storedProducts;
  }

  const storedRewards = getStored<Reward[]>(STORAGE_KEYS.REWARDS, []);
  if (storedRewards.length === 0) {
    cacheRewards = INITIAL_REWARDS.map((r, idx) => ({
      id: `rew_${idx + 1}`,
      ...r,
      createdAt: new Date().toISOString()
    }));
    setStored(STORAGE_KEYS.REWARDS, cacheRewards);
  } else {
    cacheRewards = storedRewards;
  }

  const storedUsers = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  if (!storedUsers.some((u) => u.email === ADMIN_EMAIL)) {
    cacheUsers = [DEFAULT_ADMIN_PROFILE, ...storedUsers];
    setStored(STORAGE_KEYS.USERS, cacheUsers);
  } else {
    cacheUsers = storedUsers;
  }

  const storedCreds = getStored<typeof cacheCreds>(STORAGE_KEYS.CREDS, []);
  if (!storedCreds.some((c) => c.email === ADMIN_EMAIL)) {
    cacheCreds = [DEFAULT_ADMIN_CREDENTIAL, ...storedCreds];
    setStored(STORAGE_KEYS.CREDS, cacheCreds);
  } else {
    cacheCreds = storedCreds;
  }

  cacheOrders = getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
  cachePointHistory = getStored<PointHistory[]>(STORAGE_KEYS.POINT_HISTORY, []);
  cacheRedemptions = getStored<Redemption[]>(STORAGE_KEYS.REDEMPTIONS, []);
}

// Initialize immediately on module load
initDatabaseState();

/**
 * Gets the permanent Google Apps Script Web App URL.
 */
export function getScriptUrl(): string {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return PERMANENT_SCRIPT_URL;
    const custom = window.localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
    if (custom && custom.trim()) return custom.trim();
    return PERMANENT_SCRIPT_URL;
  } catch {
    return PERMANENT_SCRIPT_URL;
  }
}

/**
 * Sets or updates the Google Apps Script Web App URL if ever overridden.
 */
export function setScriptUrl(url: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url.trim() || PERMANENT_SCRIPT_URL);
    syncWithSpreadsheet();
  } catch (e) {
    console.error('Failed to set script URL:', e);
  }
}

/**
 * Sends a POST payload to Google Apps Script Web App reliably.
 * Uses 'text/plain;charset=utf-8' and 'no-cors' mode so the browser does NOT issue
 * a preflight OPTIONS request (which Google Apps Script does not accept).
 * Google Apps Script's doPost(e) directly extracts e.postData.contents and executes immediately.
 */
export async function postToSheet(payload: any): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Spreadsheet POST sync notification:', err);
    return false;
  }
}

/**
 * Performs a background sync with the Google Apps Script Web App to pull live data.
 */
export async function syncWithSpreadsheet(): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const res = await fetch(`${url}?action=getAllData`, { method: 'GET', mode: 'cors' });
    if (!res.ok) return false;
    const json = await res.json();
    if (json && json.success) {
      if (Array.isArray(json.products)) {
        cacheProducts = json.products.map((p: any) => ({
          ...p,
          id: String(p.id ?? ''),
          nama: String(p.nama ?? ''),
          deskripsi: String(p.deskripsi ?? ''),
          kategori: String(p.kategori ?? 'Signature'),
          gambar: String(p.gambar ?? ''),
          harga: Number(p.harga) || 0,
          stok: Number(p.stok) || 0
        }));
        setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
        notify('products');
      }
      if (Array.isArray(json.rewards)) {
        cacheRewards = json.rewards.map((r: any) => ({
          ...r,
          id: String(r.id ?? ''),
          nama: String(r.nama ?? ''),
          deskripsi: String(r.deskripsi ?? ''),
          gambar: String(r.gambar ?? ''),
          poinDibutuhkan: Number(r.poinDibutuhkan) || 10,
          stok: Number(r.stok) || 0
        }));
        setStored(STORAGE_KEYS.REWARDS, cacheRewards);
        notify('rewards');
      }
      if (Array.isArray(json.orders)) {
        cacheOrders = json.orders.map((o: any) => ({
          ...o,
          id: String(o.id ?? ''),
          userId: String(o.userId ?? ''),
          userName: String(o.userName ?? ''),
          userPhone: String(o.userPhone ?? ''),
          userAddress: String(o.userAddress ?? ''),
          catatan: String(o.catatan ?? ''),
          total: Number(o.total) || 0,
          status: o.status || 'Menunggu',
          metodeBayar: o.metodeBayar || 'qris',
          sumber: o.sumber || 'online',
          poinDidapat: Number(o.poinDidapat) || 0,
          items: Array.isArray(o.items) ? o.items : []
        }));
        setStored(STORAGE_KEYS.ORDERS, cacheOrders);
        notify('orders');
      }
      if (Array.isArray(json.users)) {
        const parsedUsers = json.users.map((u: any) => {
          let cleanPhone = String(u.noHp ?? '');
          if (
            cleanPhone === '#ERROR!' ||
            cleanPhone === '#VALUE!' ||
            cleanPhone === 'undefined' ||
            cleanPhone === 'null'
          ) {
            cleanPhone = u.email === ADMIN_EMAIL ? '+62 812-3456-7890' : '';
          }
          const rawIsMember = u.isMember;
          const isMemberBool = Boolean(
            rawIsMember === true ||
            rawIsMember === 1 ||
            String(rawIsMember).toLowerCase() === 'true' ||
            String(rawIsMember).toLowerCase() === 'yes' ||
            String(rawIsMember).toLowerCase() === 'ya' ||
            String(rawIsMember).toLowerCase() === '1'
          );
          return {
            ...u,
            uid: String(u.uid ?? ''),
            nama: String(u.nama ?? ''),
            email: String(u.email ?? ''),
            noHp: cleanPhone,
            alamat: String(u.alamat ?? ''),
            role: (u.role === 'admin' || (u.email || '').toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user') as UserProfile['role'],
            isMember: isMemberBool,
            poin: Number(u.poin) || 0
          };
        });

        // Ensure default admin profile is preserved if not present
        if (!parsedUsers.some((u: UserProfile) => u.email === ADMIN_EMAIL)) {
          parsedUsers.unshift(DEFAULT_ADMIN_PROFILE);
        }

        cacheUsers = parsedUsers;
        setStored(STORAGE_KEYS.USERS, cacheUsers);
        notify('users');
      }
      if (Array.isArray(json.pointHistory)) {
        cachePointHistory = json.pointHistory;
        setStored(STORAGE_KEYS.POINT_HISTORY, cachePointHistory);
        notify('pointHistory');
      }
      if (Array.isArray(json.redemptions)) {
        cacheRedemptions = json.redemptions;
        setStored(STORAGE_KEYS.REDEMPTIONS, cacheRedemptions);
        notify('redemptions');
      }
      if (json.settings && typeof json.settings === 'object') {
        let cleanContact = String(json.settings.kontak ?? '');
        if (cleanContact === '#ERROR!' || cleanContact === '#VALUE!' || cleanContact === 'undefined') {
          cleanContact = '+62 82141837093';
        }
        let cleanBankAcc = String(json.settings.bankAccountNumber ?? '');
        if (cleanBankAcc === '#ERROR!' || cleanBankAcc === '#VALUE!' || cleanBankAcc === 'undefined') {
          cleanBankAcc = '1360030935750';
        }
        cacheSettings = {
          ...cacheSettings,
          ...json.settings,
          namaToko: String(json.settings.namaToko || cacheSettings.namaToko),
          kontak: cleanContact,
          alamatToko: String(json.settings.alamatToko || cacheSettings.alamatToko),
          nilaiPerPoin: Number(json.settings.nilaiPerPoin) || cacheSettings.nilaiPerPoin,
          qrisMerchantName: String(json.settings.qrisMerchantName || cacheSettings.qrisMerchantName),
          qrisImageUrl: String(json.settings.qrisImageUrl || cacheSettings.qrisImageUrl),
          bankName: String(json.settings.bankName || cacheSettings.bankName),
          bankAccountNumber: cleanBankAcc,
          bankAccountHolder: String(json.settings.bankAccountHolder || cacheSettings.bankAccountHolder)
        };
        setStored(STORAGE_KEYS.SETTINGS, cacheSettings);
        notify('settings');
      }
      return true;
    }
  } catch (err) {
    console.warn('Spreadsheet sync attempt:', err);
  }
  return false;
}

// Initial background sync on launch
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncWithSpreadsheet().catch(() => {});
  }, 100);
}

// ==================== STORE SETTINGS ====================
export async function getStoreSettings(): Promise<StoreSettings> {
  return cacheSettings;
}

export function subscribeStoreSettings(callback: (settings: StoreSettings) => void): () => void {
  callback(cacheSettings);
  const cb = () => callback(cacheSettings);
  listeners.settings.add(cb);
  return () => {
    listeners.settings.delete(cb);
  };
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<void> {
  cacheSettings = { ...cacheSettings, ...newSettings };
  setStored(STORAGE_KEYS.SETTINGS, cacheSettings);
  notify('settings');

  await postToSheet({ action: 'updateSettings', settings: newSettings });
}

// ==================== USERS & MEMBERS ====================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const found = cacheUsers.find((u) => u.uid === uid);
  return found || null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const existingIdx = cacheUsers.findIndex((u) => u.uid === profile.uid || u.email === profile.email);
  if (existingIdx !== -1) {
    cacheUsers[existingIdx] = { ...cacheUsers[existingIdx], ...profile };
  } else {
    cacheUsers.push(profile);
  }
  setStored(STORAGE_KEYS.USERS, cacheUsers);
  notify('users');

  // Persist directly to Google Spreadsheet
  await postToSheet({ action: 'saveUser', user: profile });
}

export async function registerAsMember(
  uid: string,
  memberData: { nama: string; noHp: string; alamat: string }
): Promise<void> {
  const idx = cacheUsers.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    cacheUsers[idx] = {
      ...cacheUsers[idx],
      nama: memberData.nama,
      noHp: memberData.noHp,
      alamat: memberData.alamat,
      isMember: true
    };
    setStored(STORAGE_KEYS.USERS, cacheUsers);
    notify('users');

    // Persist directly to Google Spreadsheet
    await postToSheet({ action: 'updateMemberStatus', uid, ...memberData });
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  cacheUsers = cacheUsers.filter((u) => u.uid !== uid);
  cacheCreds = cacheCreds.filter((c) => c.uid !== uid);
  setStored(STORAGE_KEYS.USERS, cacheUsers);
  setStored(STORAGE_KEYS.CREDS, cacheCreds);
  notify('users');

  // Delete directly from Google Spreadsheet
  await postToSheet({ action: 'deleteUser', uid, id: uid });
}

export function subscribeAllUsers(callback: (users: UserProfile[]) => void): () => void {
  callback(cacheUsers);
  const cb = () => callback(cacheUsers);
  listeners.users.add(cb);
  return () => {
    listeners.users.delete(cb);
  };
}

// ==================== PRODUCTS ====================
export function subscribeProducts(callback: (products: Product[]) => void): () => void {
  callback(cacheProducts);
  const cb = () => callback(cacheProducts);
  listeners.products.add(cb);
  return () => {
    listeners.products.delete(cb);
  };
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const id = `prod_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newProduct: Product = {
    id,
    ...product,
    createdAt: now,
    updatedAt: now
  };
  cacheProducts.unshift(newProduct);
  setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
  notify('products');

  // Insert row in Google Spreadsheet
  await postToSheet({ action: 'addProduct', product: newProduct });
  return id;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const idx = cacheProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    cacheProducts[idx] = {
      ...cacheProducts[idx],
      ...product,
      updatedAt: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
    notify('products');

    // Update row in Google Spreadsheet
    await postToSheet({ action: 'updateProduct', id, product });
  }
}

export async function deleteProduct(id: string): Promise<void> {
  cacheProducts = cacheProducts.filter((p) => p.id !== id);
  setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
  notify('products');

  // Delete row in Google Spreadsheet
  await postToSheet({ action: 'deleteProduct', id });
}

// ==================== REWARDS ====================
export function subscribeRewards(callback: (rewards: Reward[]) => void): () => void {
  callback(cacheRewards);
  const cb = () => callback(cacheRewards);
  listeners.rewards.add(cb);
  return () => {
    listeners.rewards.delete(cb);
  };
}

export async function addReward(reward: Omit<Reward, 'id'>): Promise<string> {
  const id = `rew_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const newReward: Reward = {
    id,
    ...reward,
    createdAt: new Date().toISOString()
  };
  cacheRewards.unshift(newReward);
  setStored(STORAGE_KEYS.REWARDS, cacheRewards);
  notify('rewards');

  // Insert row in Google Spreadsheet
  await postToSheet({ action: 'addReward', reward: newReward });
  return id;
}

export async function updateReward(id: string, reward: Partial<Reward>): Promise<void> {
  const idx = cacheRewards.findIndex((r) => r.id === id);
  if (idx !== -1) {
    cacheRewards[idx] = { ...cacheRewards[idx], ...reward };
    setStored(STORAGE_KEYS.REWARDS, cacheRewards);
    notify('rewards');

    // Update row in Google Spreadsheet
    await postToSheet({ action: 'updateReward', id, reward });
  }
}

export async function deleteReward(id: string): Promise<void> {
  cacheRewards = cacheRewards.filter((r) => r.id !== id);
  setStored(STORAGE_KEYS.REWARDS, cacheRewards);
  notify('rewards');

  // Delete row in Google Spreadsheet
  await postToSheet({ action: 'deleteReward', id });
}

// ==================== ORDERS ====================
export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  const id = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newOrder: Order = {
    id,
    ...orderData,
    createdAt: now,
    updatedAt: now
  };

  cacheOrders.unshift(newOrder);
  setStored(STORAGE_KEYS.ORDERS, cacheOrders);

  // Potong stok produk di lokal
  if (Array.isArray(orderData.items)) {
    orderData.items.forEach((item) => {
      const prodIdx = cacheProducts.findIndex((p) => p.id === item.productId);
      if (prodIdx !== -1) {
        cacheProducts[prodIdx].stok = Math.max(0, cacheProducts[prodIdx].stok - item.jumlah);
      }
    });
    setStored(STORAGE_KEYS.PRODUCTS, cacheProducts);
    notify('products');
  }

  notify('orders');

  // Insert row in Google Spreadsheet
  await postToSheet({
    action: 'createOrder',
    ...newOrder,
    items: JSON.stringify(newOrder.items)
  });

  return id;
}

export async function deleteOrder(orderId: string): Promise<void> {
  cacheOrders = cacheOrders.filter((o) => o.id !== orderId);
  setStored(STORAGE_KEYS.ORDERS, cacheOrders);
  notify('orders');

  // Delete row in Google Spreadsheet
  await postToSheet({ action: 'deleteOrder', orderId, id: orderId });
}

export function subscribeUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  const filterOrders = () => {
    const userOrders = cacheOrders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(userOrders);
  };

  filterOrders();
  const cb = () => filterOrders();
  listeners.orders.add(cb);
  return () => {
    listeners.orders.delete(cb);
  };
}

export function subscribeAllOrders(callback: (orders: Order[]) => void): () => void {
  const filterOrders = () => {
    const list = [...cacheOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    callback(list);
  };

  filterOrders();
  const cb = () => filterOrders();
  listeners.orders.add(cb);
  return () => {
    listeners.orders.delete(cb);
  };
}

/**
 * Updates order status.
 * CRITICAL BUSINESS RULE:
 * When status changes to "Selesai", points are awarded ONLY IF the customer is already a Member.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const orderIdx = cacheOrders.findIndex((o) => o.id === orderId);
  if (orderIdx === -1) {
    throw new Error('Pesanan tidak ditemukan');
  }

  const order = cacheOrders[orderIdx];
  const oldStatus = order.status;
  const now = new Date().toISOString();

  cacheOrders[orderIdx] = {
    ...order,
    status: newStatus,
    updatedAt: now
  };
  setStored(STORAGE_KEYS.ORDERS, cacheOrders);
  notify('orders');

  // Rule: Award points if status changed to 'Selesai' and user is a Member
  if (newStatus === 'Selesai' && oldStatus !== 'Selesai' && order.poinDidapat > 0 && order.userId) {
    const userIdx = cacheUsers.findIndex((u) => u.uid === order.userId);
    if (userIdx !== -1) {
      const user = cacheUsers[userIdx];
      if (user.isMember) {
        cacheUsers[userIdx] = {
          ...user,
          poin: (user.poin || 0) + order.poinDidapat
        };
        setStored(STORAGE_KEYS.USERS, cacheUsers);
        notify('users');

        // Add Point History
        const pointRecord: PointHistory = {
          id: `pth_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          userId: order.userId,
          tipe: 'masuk',
          jumlah: order.poinDidapat,
          keterangan: `Poin belanja pesanan #${orderId.slice(0, 6)} (${order.sumber})`,
          createdAt: now
        };
        cachePointHistory.unshift(pointRecord);
        setStored(STORAGE_KEYS.POINT_HISTORY, cachePointHistory);
        notify('pointHistory');
      }
    }
  }

  // Update in Google Spreadsheet
  await postToSheet({ action: 'updateOrderStatus', orderId, newStatus });
}

/**
 * Input manual offline order from cashier
 */
export async function inputManualOfflineOrder(params: {
  memberId: string;
  memberName: string;
  memberPhone?: string;
  items: OrderItem[];
  total: number;
  metodeBayar: PaymentMethod;
  catatan?: string;
  status: OrderStatus;
  poinDidapat: number;
}): Promise<string> {
  const id = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id,
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
    createdAt: now,
    updatedAt: now
  };

  cacheOrders.unshift(newOrder);
  setStored(STORAGE_KEYS.ORDERS, cacheOrders);

  // If status is immediately Selesai, award points to member
  if (params.status === 'Selesai' && params.poinDidapat > 0 && params.memberId) {
    const userIdx = cacheUsers.findIndex((u) => u.uid === params.memberId);
    if (userIdx !== -1) {
      const user = cacheUsers[userIdx];
      if (user.isMember) {
        cacheUsers[userIdx] = {
          ...user,
          poin: (user.poin || 0) + params.poinDidapat
        };
        setStored(STORAGE_KEYS.USERS, cacheUsers);
        notify('users');

        const pointRecord: PointHistory = {
          id: `pth_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          userId: params.memberId,
          tipe: 'masuk',
          jumlah: params.poinDidapat,
          keterangan: `Poin belanja offline #${id.slice(0, 6)}`,
          createdAt: now
        };
        cachePointHistory.unshift(pointRecord);
        setStored(STORAGE_KEYS.POINT_HISTORY, cachePointHistory);
        notify('pointHistory');
      }
    }
  }

  notify('orders');

  // Insert in Google Spreadsheet
  await postToSheet({
    action: 'manualOfflineOrder',
    ...params,
    id,
    items: JSON.stringify(params.items)
  });

  return id;
}

// ==================== POINT REDEMPTIONS ====================
export async function redeemReward(userId: string, userName: string, reward: Reward): Promise<void> {
  const userIdx = cacheUsers.findIndex((u) => u.uid === userId);
  const rewardIdx = cacheRewards.findIndex((r) => r.id === reward.id);

  if (userIdx === -1) throw new Error('Pengguna tidak ditemukan.');
  if (rewardIdx === -1) throw new Error('Reward tidak ditemukan.');

  const user = cacheUsers[userIdx];
  const currentReward = cacheRewards[rewardIdx];

  if (!user.isMember) {
    throw new Error('Hanya akun dengan status Member yang dapat menukarkan poin.');
  }

  const userPoin = user.poin || 0;
  if (userPoin < currentReward.poinDibutuhkan) {
    throw new Error(
      `Poin tidak mencukupi. Anda butuh ${currentReward.poinDibutuhkan} poin (Poin Anda: ${userPoin}).`
    );
  }

  if (currentReward.stok <= 0) {
    throw new Error('Maaf, stok hadiah reward ini sedang habis.');
  }

  const remainingPoin = userPoin - currentReward.poinDibutuhkan;
  const now = new Date().toISOString();

  // Deduct points
  cacheUsers[userIdx] = { ...user, poin: remainingPoin };
  setStored(STORAGE_KEYS.USERS, cacheUsers);
  notify('users');

  // Deduct stock
  cacheRewards[rewardIdx] = {
    ...currentReward,
    stok: Math.max(0, currentReward.stok - 1)
  };
  setStored(STORAGE_KEYS.REWARDS, cacheRewards);
  notify('rewards');

  // Record point history
  const historyRecord: PointHistory = {
    id: `pth_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    tipe: 'keluar',
    jumlah: currentReward.poinDibutuhkan,
    keterangan: `Penukaran reward: ${currentReward.nama}`,
    createdAt: now
  };
  cachePointHistory.unshift(historyRecord);
  setStored(STORAGE_KEYS.POINT_HISTORY, cachePointHistory);
  notify('pointHistory');

  // Record redemption
  const redemptionRecord: Redemption = {
    id: `rdm_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userName,
    rewardId: reward.id,
    namaReward: currentReward.nama,
    poinDipakai: currentReward.poinDibutuhkan,
    status: 'Selesai',
    createdAt: now
  };
  cacheRedemptions.unshift(redemptionRecord);
  setStored(STORAGE_KEYS.REDEMPTIONS, cacheRedemptions);
  notify('redemptions');

  // Persist in Google Spreadsheet
  await postToSheet({
    action: 'redeemReward',
    userId,
    userName,
    rewardId: reward.id,
    namaReward: currentReward.nama,
    poinDipakai: currentReward.poinDibutuhkan
  });
}

export function subscribeUserPointHistory(
  userId: string,
  callback: (history: PointHistory[]) => void
): () => void {
  const filterHistory = () => {
    const list = cachePointHistory
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  };

  filterHistory();
  const cb = () => filterHistory();
  listeners.pointHistory.add(cb);
  return () => {
    listeners.pointHistory.delete(cb);
  };
}

export function subscribeUserRedemptions(
  userId: string,
  callback: (redemptions: Redemption[]) => void
): () => void {
  const filterRedemptions = () => {
    const list = cacheRedemptions
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  };

  filterRedemptions();
  const cb = () => filterRedemptions();
  listeners.redemptions.add(cb);
  return () => {
    listeners.redemptions.delete(cb);
  };
}

export function subscribeAllRedemptions(callback: (redemptions: Redemption[]) => void): () => void {
  const filterRedemptions = () => {
    const list = [...cacheRedemptions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    callback(list);
  };

  filterRedemptions();
  const cb = () => filterRedemptions();
  listeners.redemptions.add(cb);
  return () => {
    listeners.redemptions.delete(cb);
  };
}

// ==================== AUTH CREDENTIAL HELPERS ====================
export async function getCredentialForUser(uid: string) {
  return cacheCreds.find((c) => c.uid === uid) || null;
}

export async function saveCredentialForUser(cred: {
  uid: string;
  email: string;
  salt: string;
  passwordHash: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const idx = cacheCreds.findIndex((c) => c.uid === cred.uid || c.email === cred.email);
  if (idx !== -1) {
    cacheCreds[idx] = { ...cred, updatedAt: now };
  } else {
    cacheCreds.push({ ...cred, updatedAt: now });
  }
  setStored(STORAGE_KEYS.CREDS, cacheCreds);

  // Sync to Google Spreadsheet UserCredentials sheet
  await postToSheet({ action: 'saveCredential', ...cred, updatedAt: now });
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  const found = cacheUsers.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  return found || null;
}

// Initial seed helper
export async function seedDatabaseIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  initDatabaseState();
  return { seeded: true, count: cacheProducts.length };
}

// Cleanup helper
export async function cleanupAllDemoData(): Promise<{ deletedUsers: number; deletedOrders: number }> {
  const initialUserCount = cacheUsers.length;
  const initialOrderCount = cacheOrders.length;

  cacheUsers = cacheUsers.filter(
    (u) =>
      u.email === ADMIN_EMAIL ||
      (!u.nama.toLowerCase().includes('demo') && !u.email.toLowerCase().includes('demo'))
  );
  cacheOrders = cacheOrders.filter(
    (o) => !o.userName.toLowerCase().includes('demo') && !o.id.toLowerCase().includes('demo')
  );

  setStored(STORAGE_KEYS.USERS, cacheUsers);
  setStored(STORAGE_KEYS.ORDERS, cacheOrders);
  notify('users');
  notify('orders');

  await postToSheet({ action: 'cleanupDemo' });

  return {
    deletedUsers: initialUserCount - cacheUsers.length,
    deletedOrders: initialOrderCount - cacheOrders.length
  };
}
