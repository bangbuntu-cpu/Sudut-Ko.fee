import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Coffee, User, Phone, MapPin, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeStoreSettings } from '../../services/dbService';
import { formatRupiah } from '../../utils/format';

interface MemberRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nilaiPerPoin?: number;
}

export const MemberRegisterModal: React.FC<MemberRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  nilaiPerPoin: initialNilaiPerPoin
}) => {
  const { userProfile, updateMemberStatus } = useAuth();
  const { showToast } = useToast();

  const [nama, setNama] = useState(userProfile?.nama || '');
  const [noHp, setNoHp] = useState(userProfile?.noHp || '');
  const [alamat, setAlamat] = useState(userProfile?.alamat || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nilaiPerPoin, setNilaiPerPoin] = useState<number>(initialNilaiPerPoin || 13000);

  useEffect(() => {
    const unsub = subscribeStoreSettings((settings) => {
      if (settings?.nilaiPerPoin) {
        setNilaiPerPoin(settings.nilaiPerPoin);
      }
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noHp.trim() || !alamat.trim()) {
      showToast('Harap lengkapi semua data pendaftaran member', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateMemberStatus(nama.trim(), noHp.trim(), alamat.trim());
      showToast('Selamat! Anda resmi menjadi Member SUDUT KO.FEE ☕', 'success', 'Pendaftaran Berhasil');
      onSuccess();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal mendaftar member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Member Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100 shadow-lg shadow-amber-900/30 mb-3">
            <Award className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Pendaftaran Member Pertama
          </span>
          <h2 className="text-2xl font-black text-stone-900">Bergabung Member SUDUT KO.FEE</h2>
          <p className="text-sm text-stone-600 mt-1 max-w-sm mx-auto">
            Khusus transaksi perdana, daftarkan diri Anda sebagai Member resmi untuk mendapatkan
            <strong> poin loyalitas</strong> &amp; klaim hadiah menarik!
          </p>
        </div>

        {/* Benefits banner */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 mb-6 text-xs text-amber-950 flex items-center gap-3">
          <Coffee className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <strong>Keuntungan Member:</strong> Dapatkan 1 poin setiap kelipatan {formatRupiah(nilaiPerPoin)} belanja.
            Poin bisa ditukar kopi gratis &amp; tumbler resmi!
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Alamat Pengiriman Lengkap
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <textarea
                required
                rows={3}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jalan, No Rumah, RT/RW, Kelurahan, Kecamatan, Kota..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-bold text-sm shadow-xl shadow-amber-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Award className="w-4 h-4" /> Daftarkan Saya &amp; Lanjut Checkout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
