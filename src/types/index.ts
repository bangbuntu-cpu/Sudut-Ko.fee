export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  noHp?: string;
  alamat?: string;
  role: UserRole;
  isMember: boolean;
  poin: number;
  createdAt: string;
}

export interface Product {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  kategori: string;
  gambar: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reward {
  id: string;
  nama: string;
  deskripsi: string;
  poinDibutuhkan: number;
  stok: number;
  gambar: string;
  createdAt?: string;
}

export type OrderStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Dibatalkan';
export type PaymentMethod = 'qris' | 'transfer' | 'cod';
export type OrderSource = 'online' | 'offline';

export interface OrderItem {
  productId: string;
  nama: string;
  harga: number;
  jumlah: number;
  subtotal: number;
  gambar?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userAddress?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  metodeBayar: PaymentMethod;
  sumber: OrderSource;
  poinDidapat: number;
  catatan?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PointHistory {
  id: string;
  userId: string;
  tipe: 'masuk' | 'keluar';
  jumlah: number;
  keterangan: string;
  createdAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  userName?: string;
  rewardId: string;
  namaReward: string;
  poinDipakai: number;
  status: 'Menunggu' | 'Selesai' | 'Dibatalkan';
  createdAt: string;
}

export interface StoreSettings {
  nilaiPerPoin: number; // e.g. 13000 = setiap Rp 13.000 dapat 1 poin
  namaToko: string;
  kontak: string;
  alamatToko: string;
  qrisMerchantName?: string;
  qrisImageUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}
