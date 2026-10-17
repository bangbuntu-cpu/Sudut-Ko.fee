import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Lock, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRupiah, calculatePoints } from '../../utils/format';
import { CheckoutModal } from './CheckoutModal';
import { AuthModal } from '../auth/AuthModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  nilaiPerPoin?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  nilaiPerPoin = 13000
}) => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { currentUser, isMember } = useAuth();
  const { showToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

  const estimatedPoints = calculatePoints(totalPrice, nilaiPerPoin);

  const handleProceedToCheckout = () => {
    // ENFORCE RULE: Pembeli TIDAK BISA melakukan pembelian tanpa melakukan login
    if (!currentUser) {
      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk melakukan pembelian.', 'warning');
      setShowAuthModal(true);
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#FAF5EE] text-[#2C1810] shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-from-right duration-300">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-800" />
                <h2 className="text-lg font-black text-stone-900">
                  Keranjang ({totalItems})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="font-bold text-stone-800 text-base">Keranjang Kosong</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto mb-5">
                    Pilih seduhan kopi favorit Anda dari katalog SUDUT KO.FEE.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-[#4A2E18] text-white text-xs font-bold shadow-md hover:bg-[#382110] transition cursor-pointer"
                  >
                    Mulai Belanja Kopi
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-xs flex gap-3.5 items-start"
                  >
                    <img
                      src={item.product.gambar}
                      alt={item.product.nama}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-stone-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.product.nama}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded-md transition shrink-0 cursor-pointer"
                          title="Hapus produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-black text-amber-900 mt-0.5">
                        {formatRupiah(item.product.harga)}
                      </div>

                      {item.notes && (
                        <div className="text-[10px] text-stone-500 italic mt-0.5 truncate">
                          "{item.notes}"
                        </div>
                      )}

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-stone-600 hover:bg-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stok}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-stone-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-bold text-stone-700">
                          {formatRupiah(item.product.harga * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-stone-200/80 bg-white/70 space-y-3">
                {/* Points Preview */}
                <div className="bg-amber-100/70 border border-amber-300/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-950 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    {isMember ? 'Poin didapat saat selesai:' : 'Potensi Poin Member:'}
                  </span>
                  <span className="font-extrabold text-amber-900">+{estimatedPoints} Poin</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-stone-500 font-medium">Total Tagihan:</span>
                  <span className="text-xl font-black text-amber-950">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>

                {/* Enforce Login to Checkout */}
                {currentUser ? (
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-bold text-sm shadow-xl shadow-amber-950/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-[#FAF5EE] font-bold text-sm shadow-xl shadow-amber-950/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk untuk Melanjutkan Pembelian</span>
                    </button>
                    <p className="text-[11px] text-center text-stone-500">
                      Anda harus masuk atau mendaftar akun terlebih dahulu sebelum dapat melakukan pesanan.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && currentUser && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={(orderId) => {
            setShowCheckout(false);
            onClose();
            onOrderSuccess(orderId);
          }}
          nilaiPerPoin={nilaiPerPoin}
        />
      )}

      {/* Auth Modal if triggered */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}
    </>
  );
};
