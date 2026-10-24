import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Sparkles, Filter, Coffee, ShoppingBag, Database } from 'lucide-react';
import { Product, StoreSettings, PRODUCT_CATEGORIES } from '../../types';
import { subscribeProducts, seedDatabaseIfEmpty, subscribeStoreSettings } from '../../services/dbService';
import { formatRupiah } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCatalogProps {
  nilaiPerPoin?: number;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ nilaiPerPoin: propNilaiPerPoin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = subscribeProducts((items) => {
      setProducts(items);
      setLoading(false);
    });
    const unsubSettings = subscribeStoreSettings((settings) => {
      setStoreSettings(settings);
    });
    return () => {
      unsub();
      unsubSettings();
    };
  }, []);

  const effectiveNilaiPerPoin = propNilaiPerPoin ?? storeSettings?.nilaiPerPoin ?? 13000;

  const categories = useMemo(() => {
    const defaultCats = ['Semua', ...PRODUCT_CATEGORIES];
    const otherCats: string[] = [];
    products.forEach((p) => {
      if (p.kategori && !defaultCats.includes(p.kategori) && !otherCats.includes(p.kategori)) {
        otherCats.push(p.kategori);
      }
    });
    return [...defaultCats, ...otherCats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'Semua' || p.kategori === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stok <= 0) {
      showToast('Maaf, produk ini sedang habis', 'warning');
      return;
    }
    addToCart(product, 1);
    showToast(`1x ${product.nama} masuk keranjang`, 'success');
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDatabaseIfEmpty();
      if (res.seeded) {
        showToast('Berhasil menambahkan 8 produk kopi pilihan dan 4 reward!', 'success');
      } else {
        showToast('Database sudah memiliki produk.', 'info');
      }
    } catch {
      showToast('Gagal memuat daftar produk kopi', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="pb-24 sm:pb-16">
      {/* Hero Banner with Coffee Vibe */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E1810] via-[#4A2E18] to-[#1F100A] text-[#FAF5EE] p-6 sm:p-10 mb-8 shadow-xl border border-amber-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Seduhan Segar &amp; Biji Pilihan
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Sensasi Kopi Pilihan SUDUT KO.FEE, Kumpulkan Poin di Tiap Cangkir
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 sm:mt-3 leading-relaxed">
            Diseduh dari biji kopi sangrai terbaik. Dapatkan poin loyalitas otomatis setiap selesai
            transaksi untuk ditukarkan dengan secangkir kopi gratis atau merchandise eksklusif!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Biji Arabika &amp; Robusta Pilihan
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1 Poin / {formatRupiah(effectiveNilaiPerPoin)} Belanja
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi favorit (Espresso, Latte, V60, Gula Aren)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {products.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow flex items-center justify-center gap-2 shrink-0 transition cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Muat Menu Bawaan</span>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#4A2E18] text-[#FAF5EE] shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200 shadow-sm animate-pulse"
            >
              <div className="w-full h-36 sm:h-48 bg-stone-200 rounded-2xl mb-3" />
              <div className="w-3/4 h-4 bg-stone-200 rounded mb-2" />
              <div className="w-1/2 h-3 bg-stone-200 rounded mb-3" />
              <div className="w-full h-8 bg-stone-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Coffee className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Kopi Tidak Ditemukan</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `Tidak ada hasil untuk pencarian "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada produk kopi yang terdaftar di database.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-2xl bg-[#4A2E18] text-white text-xs font-bold shadow-md hover:bg-[#382110] transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              Muat Menu Kopi Bawaan
            </button>
          )}
        </div>
      ) : (
        /* Product Grid: 2-column on mobile, 4-column on desktop */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stok <= 0;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 hover:border-amber-700/50 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image & Category Pill */}
                <div className="relative h-36 sm:h-48 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.gambar}
                    alt={product.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2C1810]/80 text-[#FAF5EE] backdrop-blur-xs">
                      {product.kategori}
                    </span>
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-black uppercase tracking-wider">
                      Habis
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-amber-900 transition-colors">
                      {product.nama}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.deskripsi}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium">
                        Stok: {product.stok}
                      </div>
                      <div className="text-sm sm:text-base font-black text-amber-950">
                        {formatRupiah(product.harga)}
                      </div>
                    </div>

                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={isOutOfStock}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF5EE] hover:bg-[#4A2E18] text-amber-900 hover:text-white border border-amber-800/20 transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-40"
                        aria-label="Tambah ke keranjang"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Pesan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
