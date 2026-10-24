import { Product, Reward, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    nama: 'Kopi Susu Gula Aren',
    deskripsi: 'Espresso bold berpadu susu segar creamy dan sirup gula aren alami khas Nusantara. Manis pas dan menyegarkan.',
    harga: 22000,
    stok: 45,
    kategori: 'Signature',
    gambar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Espresso Double Shot',
    deskripsi: 'Ekstraksi 100% biji kopi Arabika Specialty dengan crema tebal keemasan, aroma dark chocolate & almond.',
    harga: 18000,
    stok: 60,
    kategori: 'Espresso Based',
    gambar: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Caramel Macchiato',
    deskripsi: 'Kombinasi harmonis susu segar lembut, sirup vanila murni, espresso shot, dan saus karamel lezat di atasnya.',
    harga: 28000,
    stok: 30,
    kategori: 'Signature',
    gambar: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Manual Brew V60 Flores',
    deskripsi: 'Single origin Arabika Flores Bajawa diseduh metode pour-over V60. Notes rasa jeruk mandarin, floral, dan aftertaste manis.',
    harga: 26000,
    stok: 25,
    kategori: 'Manual Brew',
    gambar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Cold Brew Signature 16-Jam',
    deskripsi: 'Kopi diseduh dingin lambat selama 16 jam. Asam sangat rendah, rasa kaya, halus di tenggorokan, sangat menyegarkan.',
    harga: 25000,
    stok: 20,
    kategori: 'Cold Brew',
    gambar: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Vanilla Velvet Latte',
    deskripsi: 'Espresso halus berpadu microfoam susu sutra dan sentuhan aroma ekstrak vanilla Bourbon alami.',
    harga: 26000,
    stok: 35,
    kategori: 'Espresso Based',
    gambar: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Cappuccino Signature',
    deskripsi: 'Rasio klasik seimbang antara espresso pekat, steamed milk, dan busa susu tebal lembut dengan taburan bubuk cokelat.',
    harga: 24000,
    stok: 40,
    kategori: 'Espresso Based',
    gambar: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Matcha Espresso Fusion',
    deskripsi: 'Layer estetis dan kaya rasa dari Matcha Uji Jepang asli berselimut susu dingin dan disiram shot espresso mantap.',
    harga: 30000,
    stok: 28,
    kategori: 'Signature',
    gambar: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_REWARDS: Omit<Reward, 'id'>[] = [
  {
    nama: '1 Cup Kopi Susu Aren Gratis',
    deskripsi: 'Voucher penukaran 1 gelas Kopi Susu Gula Aren ukuran reguler di SUDUT KO.FEE.',
    poinDibutuhkan: 10,
    stok: 100,
    gambar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Tumbler Eksklusif SUDUT KO.FEE (500ml)',
    deskripsi: 'Tumbler stainless steel vacuum insulated tahan panas dan dingin hingga 12 jam, ramah lingkungan edisi SUDUT KO.FEE.',
    poinDibutuhkan: 30,
    stok: 15,
    gambar: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Biji Kopi Arabika Specialty 250g',
    deskripsi: 'Kemasan biji kopi sangrai fresh roast premium siap digiling sesuai selera Anda di rumah.',
    poinDibutuhkan: 45,
    stok: 20,
    gambar: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=600&auto=format&fit=crop'
  },
  {
    nama: 'Kaos Barista SUDUT KO.FEE (Cotton 24s)',
    deskripsi: 'Kaos merchandise resmi SUDUT KO.FEE berbahan katun nyaman dan sablon premium edisi terbatas.',
    poinDibutuhkan: 65,
    stok: 12,
    gambar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop'
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  nilaiPerPoin: 13000, // Rp 13.000 = 1 Poin
  namaToko: 'SUDUT KO.FEE',
  kontak: '+62 812-3456-7890',
  alamatToko: 'Jl. Senopati No. 45, Jakarta Selatan',
  qrisMerchantName: 'SUDUT KO.FEE',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=00020101021226580014ID.LINKAJA.WWW01189360091100223948515204581253033605802ID5910SUDUT KOFEE6007JAKARTA62070703A016304',
  bankName: 'BCA Virtual Account',
  bankAccountNumber: '8000812990012345',
  bankAccountHolder: 'PT SUDUT KO.FEE NUSANTARA',
  hargaEspresso: 4000,
  hargaSeasalt: 5000,
  hargaOatmilk: 6000,
  hargaAlmond: 6000,
  hargaUpsize: 4000
};
