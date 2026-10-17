import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Coffee, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.stok <= 0) {
      showToast('Maaf, stok produk ini sedang habis', 'warning');
      return;
    }
    addToCart(product, quantity, notes);
    setIsAdded(true);
    showToast(`${quantity}x ${product.nama} dimasukkan ke keranjang`, 'success');
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-stone-700 p-2 rounded-full shadow-md backdrop-blur-sm transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative h-60 sm:h-72 w-full bg-stone-200 overflow-hidden">
          <img
            src={product.gambar}
            alt={product.nama}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#2C1810]/85 text-[#FAF5EE] backdrop-blur-md shadow-md">
              {product.kategori}
            </span>
          </div>
          {product.stok <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg backdrop-blur-xs">
              Stok Habis
            </div>
          )}
        </div>

        {/* Product Details Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">{product.nama}</h2>
              <div className="text-xs text-stone-500 mt-0.5">
                Tersedia {product.stok} porsi
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900">
              {formatRupiah(product.harga)}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed my-3 line-clamp-4">
            {product.deskripsi}
          </p>

          {/* Notes input */}
          <div className="my-4">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Catatan Pesanan (opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Less sugar / less ice / tanpa sedotan..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          {/* Quantity and Add Button */}
          <div className="flex items-center gap-4 pt-2">
            {/* Quantity Counter */}
            <div className="flex items-center border border-stone-300 rounded-2xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition"
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stok, q + 1))}
                disabled={quantity >= product.stok}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition disabled:opacity-30"
                aria-label="Tambah jumlah"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Submit Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stok <= 0}
              className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] shadow-amber-950/20'
              } disabled:opacity-50`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Dimasukkan
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang •{' '}
                  {formatRupiah(product.harga * quantity)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
