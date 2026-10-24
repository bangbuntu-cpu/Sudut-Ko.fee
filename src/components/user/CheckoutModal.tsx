import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  MapPin,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { createOrder, subscribeStoreSettings } from '../../services/dbService';
import { formatRupiah, calculatePoints, getDirectImageUrl } from '../../utils/format';
import { PaymentMethod, StoreSettings } from '../../types';
import { MemberRegisterModal } from '../common/MemberRegisterModal';
import { AuthModal } from '../auth/AuthModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  nilaiPerPoin?: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  nilaiPerPoin = 13000
}) => {
  const { currentUser, userProfile, isMember, isAdmin } = useAuth();
  const { items, totalPrice, toOrderItems, clearCart } = useCart();
  const { showToast } = useToast();

  if (isAdmin) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [nama, setNama] = useState(String(userProfile?.nama || ''));
  const [phone, setPhone] = useState(String(userProfile?.noHp || ''));
  const [address, setAddress] = useState(String(userProfile?.alamat || ''));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Sub-modals for Auth or Member registration
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const unsub = subscribeStoreSettings((settings) => {
      setStoreSettings(settings);
    });
    return () => unsub();
  }, []);

  // Sync state if userProfile updates
  React.useEffect(() => {
    if (userProfile) {
      if (!nama) setNama(String(userProfile.nama || ''));
      if (!phone) setPhone(String(userProfile.noHp || ''));
      if (!address) setAddress(String(userProfile.alamat || ''));
    }
  }, [userProfile]);

  if (!isOpen) return null;

  // Strict rule: Pembeli TIDAK BISA melakukan pembelian tanpa melakukan login
  if (!currentUser) {
    return (
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        initialMode="login"
      />
    );
  }

  const estimatedPoints = calculatePoints(totalPrice, nilaiPerPoin);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Must be logged in
    if (!currentUser) {
      setShowAuthModal(true);
      showToast('Silakan masuk atau buat akun untuk melanjutkan checkout', 'info');
      return;
    }

    // 2. CRITICAL BUSINESS RULE:
    // First-time consumer MUST be registered as Member before transaction completes!
    if (!isMember) {
      setShowMemberModal(true);
      showToast('Pendaftaran Member diperlukan sebelum menyelesaikan pesanan pertama', 'info');
      return;
    }

    const cleanPhone = String(phone || '').trim();
    const cleanAddress = String(address || '').trim();

    if (!cleanPhone || !cleanAddress) {
      showToast('Harap lengkapi nomor telepon dan alamat pengiriman', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderId = await createOrder({
        userId: currentUser.uid,
        userName: String(nama || userProfile?.nama || 'Pelanggan').trim(),
        userPhone: cleanPhone,
        userAddress: cleanAddress,
        items: toOrderItems(),
        total: totalPrice,
        status: 'Menunggu',
        metodeBayar: paymentMethod,
        sumber: 'online',
        poinDidapat: estimatedPoints,
        catatan: String(notes || '').trim(),
        createdAt: new Date().toISOString()
      });

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti errors
      }

      clearCart();
      showToast('Pesanan berhasil dibuat! SUDUT KO.FEE segera menyiapkan pesanan Anda.', 'success');
      onOrderSuccess(orderId);
      onClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal memproses pesanan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBankNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedBank(true);
    showToast('Nomor rekening disalin ke papan klip', 'info');
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Checkout Pesanan
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Periksa ringkasan pesanan &amp; pilih metode pembayaran favorit Anda
            </p>
          </div>

          {/* Member Point Notification Banner */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-200/60 border border-amber-300 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {isMember ? (
                  <>
                    Member terverifikasi! Anda akan mendapat{' '}
                    <strong>+{estimatedPoints} Poin</strong> setelah pesanan selesai.
                  </>
                ) : (
                  <>
                    Transaksi pertama Anda otomatis didaftarkan menjadi <strong>Member Resmi</strong>{' '}
                    untuk klaim poin loyalitas!
                  </>
                )}
              </span>
            </div>
            <span className="font-extrabold text-amber-900 bg-amber-300/80 px-2 py-0.5 rounded-lg shrink-0">
              +{estimatedPoints} Poin
            </span>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Delivery Data */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Informasi Pengiriman &amp; Penerima
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Nama Penerima
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Alamat Lengkap (Antar ke Meja / Rumah)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat lengkap, patokan, atau nomor meja jika di kafe..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Catatan untuk Barista / Kurir (opsional)
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Misal: jangan pakai sedotan plastik..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                Metode Pembayaran
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'qris'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-700" />
                  <span className="text-[11px]">QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'transfer'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-700" />
                  <span className="text-[11px]">Transfer Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cod'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <Truck className="w-5 h-5 text-amber-700" />
                  <span className="text-[11px]">Bayar di Tempat</span>
                </button>
              </div>

              {/* Payment Details / Simulation */}
              {paymentMethod === 'qris' && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-stone-200 mb-2">
                    <img
                      src={getDirectImageUrl(storeSettings?.qrisImageUrl) || 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=00020101021226580014ID.LINKAJA.WWW01189360091100223948515204581253033605802ID5910SUDUT KOFEE6007JAKARTA62070703A016304'}
                      alt={`QRIS ${storeSettings?.qrisMerchantName || 'SUDUT KO.FEE'}`}
                      className="w-32 h-32 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-xs font-bold text-stone-800">
                    Scan via QRIS • Merchant: {storeSettings?.qrisMerchantName || 'SUDUT KO.FEE'}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Total: {formatRupiah(totalPrice)} • Otomatis terverifikasi
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
                    <div>
                      <div className="font-bold text-stone-800">{storeSettings?.bankName || 'BCA Virtual Account'}</div>
                      <div className="text-stone-500 text-[11px] font-mono">
                        {storeSettings?.bankAccountNumber || '8000812990012345'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyBankNumber(storeSettings?.bankAccountNumber || '8000812990012345')}
                      className="p-1.5 text-stone-500 hover:text-amber-800 rounded-lg hover:bg-stone-100 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBank ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <div className="text-[10px] text-stone-500 text-center">
                    Atas nama: <strong>{storeSettings?.bankAccountHolder || 'PT SUDUT KO.FEE NUSANTARA'}</strong>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Siapkan uang pas sejumlah <strong>{formatRupiah(totalPrice)}</strong> saat kopi
                    diantar atau dibayar langsung di kasir toko.
                  </span>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({items.length} jenis produk)</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Ongkir / Biaya Layanan</span>
                <span className="text-emerald-700 font-bold">GRATIS</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between items-center text-sm font-black text-stone-900">
                <span>Total Pembayaran</span>
                <span className="text-base text-amber-950">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-extrabold text-sm shadow-xl shadow-amber-950/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Konfirmasi &amp; Bayar {formatRupiah(totalPrice)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Auth Modal if not signed in */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
      />

      {/* Member Registration Modal if first-time consumer */}
      <MemberRegisterModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSuccess={() => {
          setShowMemberModal(false);
          showToast('Status Member aktif! Lanjutkan checkout sekarang.', 'success');
        }}
      />
    </>
  );
};
