import React, { useState } from 'react';
import {
  Coffee,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  canClose = true
}) => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        showToast('Berhasil masuk ke SUDUT KO.FEE!', 'success');
        if (onClose) onClose();
      } else {
        const cleanNama = String(nama || '').trim();
        const cleanEmail = String(email || '').trim();

        if (!cleanNama) {
          setErrorMessage('Nama lengkap wajib diisi');
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          setErrorMessage('Format email tidak valid (contoh: user@domain.com)');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Password minimal 6 karakter');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Konfirmasi password tidak cocok');
          setLoading(false);
          return;
        }

        await registerWithEmail(email, password, confirmPassword, nama);
        showToast('Pendaftaran berhasil! Akun Anda aktif.', 'success');
        if (onClose) onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan autentikasi';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto">
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4A2E18] text-[#E5BA73] shadow-md mb-2">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">SUDUT KO.FEE</h2>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900/80 block mt-0.5">
            BEANS &amp; REWARDS
          </span>
          <p className="text-xs text-stone-600 mt-1">
            {mode === 'login'
              ? 'Silakan masuk dengan email dan password akun Anda'
              : 'Daftarkan akun baru untuk mulai menikmati kopi & keuntungan member'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-stone-200/80 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[#4A2E18] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[#4A2E18] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error Alert Box if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Akun
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Daftar Akun Baru
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer Link */}
        <div className="mt-5 text-center text-xs text-stone-500 border-t border-stone-200 pt-4">
          {mode === 'login' ? (
            <p>
              Belum memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
              >
                Daftar Sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
              >
                Masuk ke Akun
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
