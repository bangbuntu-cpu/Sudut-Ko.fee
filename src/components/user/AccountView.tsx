import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  ShoppingBag,
  Sparkles,
  Phone,
  MapPin,
  Mail,
  QrCode,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  LogOut,
  Edit2,
  Check
} from 'lucide-react';
import { Order, PointHistory } from '../../types';
import {
  subscribeUserOrders,
  subscribeUserPointHistory,
  registerAsMember
} from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRupiah, formatDate, getStatusBadge } from '../../utils/format';
import { AuthModal } from '../auth/AuthModal';
import { MemberRegisterModal } from '../common/MemberRegisterModal';

export const AccountView: React.FC = () => {
  const { currentUser, userProfile, isMember, logout } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'points' | 'profile'>('orders');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubOrders = subscribeUserOrders(currentUser.uid, (list) => {
      setOrders(list);
    });

    const unsubPoints = subscribeUserPointHistory(currentUser.uid, (list) => {
      setPointHistory(list);
    });

    return () => {
      unsubOrders();
      unsubPoints();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="pb-24 sm:pb-16 max-w-md mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-4 shadow-md">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Masuk ke Akun SUDUT KO.FEE</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6 leading-relaxed">
          Masuk atau buat akun untuk melihat Kartu Member digital Anda, riwayat pesanan, dan akumulasi poin.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full py-3.5 rounded-2xl bg-[#4A2E18] text-[#FAF5EE] font-bold text-sm shadow-xl hover:bg-[#382110] transition cursor-pointer"
        >
          Masuk / Daftar Akun
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const memberTier = (userProfile?.poin || 0) >= 100
    ? 'Platinum Member'
    : (userProfile?.poin || 0) >= 50
    ? 'Gold Member'
    : (userProfile?.poin || 0) >= 20
    ? 'Silver Member'
    : 'Bronze Member';

  return (
    <div className="pb-24 sm:pb-16 max-w-4xl mx-auto space-y-6">
      {/* Digital Member Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D1B13] via-[#482E1E] to-[#1A0E08] text-[#FAF5EE] p-6 sm:p-8 shadow-2xl border border-amber-600/30">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full min-h-[190px]">
          {/* Card Top */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/80">
                  KARTU MEMBER RESMI
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight">SUDUT KO.FEE</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 uppercase tracking-wider shadow">
                {isMember ? memberTier : 'Non-Member'}
              </span>
            </div>
          </div>

          {/* Card Center & Points */}
          <div className="my-5 flex items-end justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block mb-0.5">Nama Anggota</span>
              <div className="text-lg sm:text-xl font-bold tracking-wide">
                {userProfile?.nama || 'Pelanggan SUDUT KO.FEE'}
              </div>
              <div className="text-xs text-amber-200/70 font-mono mt-0.5">
                ID: {currentUser.uid.slice(0, 10).toUpperCase()}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-400 block mb-0.5">Total Poin</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                {userProfile?.poin || 0}{' '}
                <span className="text-sm font-semibold text-amber-100">PTS</span>
              </div>
            </div>
          </div>

          {/* Card Bottom */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Bergabung sejak: {formatDate(userProfile?.createdAt || new Date().toISOString())}
            </span>
            {!isMember && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="text-amber-300 font-bold hover:underline flex items-center gap-1"
              >
                Aktifkan Status Member <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-stone-200/80 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#4A2E18] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Pesanan ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'points'
              ? 'bg-[#4A2E18] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          Riwayat Poin ({pointHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#4A2E18] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4" />
          Profil Saya
        </button>
      </div>

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <h3 className="font-bold text-stone-800 text-sm">Belum Ada Pesanan</h3>
              <p className="text-xs text-stone-500 mt-1">
                Kopi nikmat menanti Anda. Pesan sekarang melalui katalog Kopi Kita!
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const badge = getStatusBadge(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        Pesanan #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(order.createdAt)}</span>
                        <span>•</span>
                        <span className="uppercase">{order.metodeBayar}</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-700">{item.jumlah}x</span>
                          <span className="text-stone-800">{item.nama}</span>
                        </div>
                        <span className="font-semibold text-stone-700">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="text-amber-800 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      +{order.poinDidapat} Poin Loyalty
                    </span>
                    <div className="text-sm font-black text-amber-950">
                      Total: {formatRupiah(order.total)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Points History */}
      {activeTab === 'points' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              Log Mutasi Poin (Masuk &amp; Keluar)
            </h3>
            <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              Saldo: {userProfile?.poin || 0} Pts
            </span>
          </div>

          {pointHistory.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              Belum ada riwayat perolehan atau penukaran poin.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {pointHistory.map((h) => {
                const isMasuk = h.tipe === 'masuk';
                return (
                  <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isMasuk
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isMasuk ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{h.keterangan}</div>
                        <div className="text-[10px] text-stone-400">{formatDate(h.createdAt)}</div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-black ${
                        isMasuk ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {isMasuk ? `+${h.jumlah}` : `-${h.jumlah}`} PTS
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">Data Profil Pengguna</h3>
            <button
              onClick={() => setShowMemberModal(true)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Perbarui Data Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1">Nama Lengkap</span>
              <span className="font-bold text-stone-800 text-sm">{userProfile?.nama}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1">Email Terdaftar</span>
              <span className="font-bold text-stone-800 text-sm">{userProfile?.email}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1">Nomor WhatsApp / HP</span>
              <span className="font-bold text-stone-800 text-sm">
                {userProfile?.noHp || 'Belum diisi'}
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1">Status Keanggotaan</span>
              <span className="font-bold text-amber-900 text-sm">
                {isMember ? 'Member Resmi (Aktif)' : 'Konsumen Reguler'}
              </span>
            </div>
            <div className="sm:col-span-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1">Alamat Pengiriman Utama</span>
              <span className="font-semibold text-stone-800 text-sm">
                {userProfile?.alamat || 'Belum diisi'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun
            </button>
          </div>
        </div>
      )}

      {/* Member Edit Modal */}
      <MemberRegisterModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSuccess={() => setShowMemberModal(false)}
      />
    </div>
  );
};
