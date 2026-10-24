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

export type ProductCategory = 'Coffee' | 'Non Coffee' | 'Black Coffee' | 'Tea Series';
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Coffee',
  'Non Coffee',
  'Black Coffee',
  'Tea Series'
];

export interface AdditionalOption {
  id: string;
  nama: string;
  harga: number;
  keterangan: string;
  badge: string;
}

export const ADDITIONAL_OPTIONS: AdditionalOption[] = [
  {
    id: 'addon_espresso',
    nama: 'Espresso',
    harga: 4000,
    keterangan: 'Ekstra 1 shot Espresso bold Arabika',
    badge: 'Extra Shot'
  },
  {
    id: 'addon_seasalt',
    nama: 'Seasalt cream',
    harga: 5000,
    keterangan: 'Topping krim gurih lembut khas Sudut Ko.fee',
    badge: 'Topping'
  },
  {
    id: 'addon_oatmilk',
    nama: 'Oatmilk',
    harga: 6000,
    keterangan: 'Ganti atau tambah susu gandum oat creamy ramah nabati',
    badge: 'Plant Based'
  },
  {
    id: 'addon_almond',
    nama: 'Almond Milk',
    harga: 6000,
    keterangan: 'Ganti atau tambah susu almond dengan aroma nutty',
    badge: 'Plant Based'
  },
  {
    id: 'addon_upsize',
    nama: 'Upsize',
    harga: 4000,
    keterangan: 'Upgrade cup ke ukuran Large untuk porsi lebih puas',
    badge: 'Large Cup'
  }
];

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
  // Additional item prices
  hargaEspresso?: number;
  hargaSeasalt?: number;
  hargaOatmilk?: number;
  hargaAlmond?: number;
  hargaUpsize?: number;
}

export function getAdditionalOptions(settings?: StoreSettings): AdditionalOption[] {
  return [
    {
      id: 'addon_espresso',
      nama: 'Espresso',
      harga: settings?.hargaEspresso ?? 4000,
      keterangan: 'Ekstra 1 shot Espresso bold Arabika',
      badge: 'Extra Shot'
    },
    {
      id: 'addon_seasalt',
      nama: 'Seasalt cream',
      harga: settings?.hargaSeasalt ?? 5000,
      keterangan: 'Topping krim gurih lembut khas Sudut Ko.fee',
      badge: 'Topping'
    },
    {
      id: 'addon_oatmilk',
      nama: 'Oatmilk',
      harga: settings?.hargaOatmilk ?? 6000,
      keterangan: 'Ganti atau tambah susu gandum oat creamy ramah nabati',
      badge: 'Plant Based'
    },
    {
      id: 'addon_almond',
      nama: 'Almond Milk',
      harga: settings?.hargaAlmond ?? 6000,
      keterangan: 'Ganti atau tambah susu almond dengan aroma nutty',
      badge: 'Plant Based'
    },
    {
      id: 'addon_upsize',
      nama: 'Upsize',
      harga: settings?.hargaUpsize ?? 4000,
      keterangan: 'Upgrade cup ke ukuran Large untuk porsi lebih puas',
      badge: 'Large Cup'
    }
  ];
}
