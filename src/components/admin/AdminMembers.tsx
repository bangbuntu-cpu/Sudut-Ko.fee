import React, { useState } from 'react';
import {
  Users,
  Search,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  PlusCircle,
  ShoppingBag,
  Clock,
  X,
  CheckCircle2,
  Coffee,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Product, Order, PaymentMethod, OrderItem } from '../../types';
import { formatRupiah, formatDate, calculatePoints } from '../../utils/format';
import {
  inputManualOfflineOrder,
  cleanupAllDemoData,
  deleteUserProfile,
  registerAsMember,
  syncWithSpreadsheet
} from '../../services/dbService';
import { useToast } from '../../context/ToastContext';

interface AdminMembersProps {
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  nilaiPerPoin?: number;
  isOpenOfflineModal?: boolean;
  onCloseOfflineModal?: () => void;
}

export const AdminMembers: React.FC<AdminMembersProps> = ({
  users,
  products,
  orders,
  nilaiPerPoin = 13000,
  isOpenOfflineModal = false,
  onCloseOfflineModal
}) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'member' | 'regular'>('all');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  // Offline transaction modal state
  const [showOfflineModal, setShowOfflineModal] = useState(isOpenOfflineModal);
  const [offlineMemberId, setOfflineMemberId] = useState('');
  const [offlineItems, setOfflineItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [offlinePayment, setOfflinePayment] = useState<PaymentMethod>('cod');
  const [offlineNotes, setOfflineNotes] = useState('');
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithSpreadsheet();
      showToast('Data member berhasil disinkronkan langsung dari Spreadsheet!', 'success');
    } catch {
      showToast('Gagal menyinkronkan data dengan Spreadsheet', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync internal modal state with prop
  React.useEffect(() => {
    if (isOpenOfflineModal) {
      setShowOfflineModal(true);
    }
  }, [isOpenOfflineModal]);

  // Show all registered users from spreadsheet except administrator
  const allCustomers = users.filter(
    (u) => u.role !== 'admin' && (u.email || '').toLowerCase() !== 'bangbuntu@gmail.com'
  );

  const filteredMembers = allCustomers.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.noHp && m.noHp.includes(search));

    if (filterType === 'member') return matchSearch && m.isMember;
    if (filterType === 'regular') return matchSearch && !m.isMember;
    return matchSearch;
  });

  const handleToggleMemberStatus = async (user: UserProfile) => {
    try {
      await registerAsMember(user.uid, {
        nama: user.nama,
        noHp: user.noHp || '',
        alamat: user.alamat || ''
      });
      showToast(
        `Status Member "${user.nama}" berhasil diaktifkan & disinkronkan ke Spreadsheet!`,
        'success'
      );
      if (selectedMember && selectedMember.uid === user.uid) {
        setSelectedMember({ ...selectedMember, isMember: true });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui status member', 'error');
    }
  };

  // Offline order calculation
  const offlineTotal = offlineItems.reduce(
    (sum, it) => sum + it.product.harga * it.quantity,
    0
  );
  const offlinePoints = calculatePoints(offlineTotal, nilaiPerPoin);

  const handleAddOfflineItem = (prod: Product) => {
    setOfflineItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === prod.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleUpdateOfflineQty = (prodId: string, delta: number) => {
    setOfflineItems((prev) => {
      return prev
        .map((it) => {
          if (it.product.id === prodId) {
            return { ...it, quantity: it.quantity + delta };
          }
          return it;
        })
        .filter((it) => it.quantity > 0);
    });
  };

  const handleSubmitOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineMemberId) {
      showToast('Pilih Member yang melakukan transaksi', 'warning');
      return;
    }
    if (offlineItems.length === 0) {
      showToast('Pilih minimal 1 item produk kopi', 'warning');
      return;
    }

    const member = allCustomers.find((m) => m.uid === offlineMemberId);
    if (!member) {
      showToast('Data member tidak ditemukan', 'error');
      return;
    }

    setIsSubmittingOffline(true);
    try {
      const orderItems: OrderItem[] = offlineItems.map((it) => ({
        productId: it.product.id,
        nama: it.product.nama,
        harga: it.product.harga,
        jumlah: it.quantity,
        subtotal: it.product.harga * it.quantity,
        gambar: it.product.gambar
      }));

      await inputManualOfflineOrder({
        memberId: member.uid,
        memberName: member.nama,
        memberPhone: member.noHp,
        items: orderItems,
        total: offlineTotal,
        metodeBayar: offlinePayment,
        catatan: String(offlineNotes || '').trim() || 'Transaksi kasir kafe (offline)',
        status: 'Selesai', // directly finished in store!
        poinDidapat: offlinePoints
      });

      showToast(
        `Transaksi offline Rp ${formatRupiah(offlineTotal)} berhasil! +${offlinePoints} Poin ditambahkan ke ${member.nama}.`,
        'success',
        'Transaksi Kasir Berhasil'
      );
      setShowOfflineModal(false);
      if (onCloseOfflineModal) onCloseOfflineModal();
      setOfflineItems([]);
      setOfflineNotes('');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan transaksi offline', 'error');
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  const handlePurgeAllDemo = async () => {
    setIsPurging(true);
    try {
      const res = await cleanupAllDemoData();
      showToast(
        `Pembersihan selesai! ${res.deletedUsers} akun demo & ${res.deletedOrders} pesanan demo dihapus permanen.`,
        'success',
        'Data Demo Dibersihkan'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal membersihkan data demo', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  const handleDeleteMember = async (member: UserProfile) => {
    if (!window.confirm(`Yakin ingin menghapus member "${member.nama}"? Data poin dan akun akan terhapus.`)) {
      return;
    }
    setIsDeletingMember(true);
    try {
      await deleteUserProfile(member.uid);
      showToast(`Member "${member.nama}" berhasil dihapus`, 'success');
      setSelectedMember(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus member', 'error');
    } finally {
      setIsDeletingMember(false);
    }
  };

  const memberOrders = selectedMember
    ? orders.filter((o) => o.userId === selectedMember.uid)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Kelola Member &amp; Konsumen ({allCustomers.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar seluruh pelanggan dan Member terdaftar di Google Spreadsheet, saldo poin, dan input kasir offline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sinkronkan data dengan Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan data'}</span>
          </button>

          <button
            type="button"
            onClick={handlePurgeAllDemo}
            disabled={isPurging}
            className="px-3.5 py-2.5 rounded-2xl border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Bersihkan semua akun demo dari database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPurging ? 'Membersihkan...' : 'Bersihkan Akun Demo'}</span>
          </button>

          <button
            onClick={() => setShowOfflineModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Transaksi Offline</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-[#4A2E18] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Semua ({allCustomers.length})
          </button>
          <button
            onClick={() => setFilterType('member')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'member'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Member Resmi ({allCustomers.filter((m) => m.isMember).length})
          </button>
          <button
            onClick={() => setFilterType('regular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'regular'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Belum Jadi Member ({allCustomers.filter((m) => !m.isMember).length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau no WhatsApp..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama &amp; Kontak</th>
                <th className="py-3.5 px-4">Alamat</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Saldo Poin</th>
                <th className="py-3.5 px-4">Bergabung</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-stone-400">
                    Tidak ada member atau pelanggan yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.uid} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {m.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{m.nama}</div>
                          <div className="text-[11px] text-stone-500">{m.email}</div>
                          <div className="text-[10px] text-stone-400">{m.noHp || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-stone-600 line-clamp-2">
                      {m.alamat || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {m.isMember ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Member Resmi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-stone-600 bg-stone-100 border border-stone-300 px-2.5 py-1 rounded-full text-[11px]">
                          <span>Pelanggan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        {m.poin || 0} PTS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!m.isMember && (
                          <button
                            onClick={() => handleToggleMemberStatus(m)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                            title="Aktifkan sebagai Member resmi di Spreadsheet"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Jadikan Member</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs transition"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#4A2E18] text-[#E5BA73] flex items-center justify-center font-black text-xl shadow">
                {selectedMember.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">{selectedMember.nama}</h2>
                <div className="mt-1 flex items-center gap-2">
                  {selectedMember.isMember ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Member Resmi Aktif</span>
                    </span>
                  ) : (
                    <>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800 uppercase">
                        Pelanggan Terdaftar
                      </span>
                      <button
                        onClick={() => handleToggleMemberStatus(selectedMember)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-700 hover:bg-amber-800 text-white transition flex items-center gap-1 shadow-xs"
                      >
                        <Award className="w-3 h-3" />
                        <span>Aktifkan Status Member</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Member Info Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-stone-400 block mb-0.5">Saldo Poin</span>
                <span className="text-lg font-black text-amber-900">
                  {selectedMember.poin || 0} PTS
                </span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-stone-400 block mb-0.5">Total Transaksi</span>
                <span className="text-lg font-black text-stone-900">
                  {memberOrders.length} Pesanan
                </span>
              </div>
              <div className="col-span-2 bg-white p-3 rounded-2xl border border-stone-200 space-y-1">
                <div className="text-stone-600 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedMember.email}</span>
                </div>
                <div className="text-stone-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedMember.noHp || 'Tidak ada no telepon'}</span>
                </div>
                <div className="text-stone-600 flex items-start gap-2 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{selectedMember.alamat || 'Tidak ada alamat terdaftar'}</span>
                </div>
              </div>
            </div>

            {/* Member Order History */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-2">
                Riwayat Pembelian Member
              </h3>
              {memberOrders.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
                  Belum ada transaksi tercatat untuk member ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {memberOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-3 rounded-xl border border-stone-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-stone-800">
                          #{ord.id.slice(0, 6)} • {formatRupiah(ord.total)}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {formatDate(ord.createdAt)} ({ord.sumber})
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteMember(selectedMember)}
                disabled={isDeletingMember}
                className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Member</span>
              </button>

              <button
                onClick={() => {
                  setOfflineMemberId(selectedMember.uid);
                  setSelectedMember(null);
                  setShowOfflineModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4A2E18] text-white text-xs font-bold shadow hover:bg-[#382110] transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Transaksi untuk Member Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Offline Order Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowOfflineModal(false);
                if (onCloseOfflineModal) onCloseOfflineModal();
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                <Coffee className="w-3.5 h-3.5 text-amber-700" /> Kasir Offline Kafe
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Input Transaksi Manual / Offline
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pilih member yang berbelanja langsung di kafe agar poin otomatis masuk ke akunnya
              </p>
            </div>

            <form onSubmit={handleSubmitOfflineOrder} className="space-y-4">
              {/* Member Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Pilih Member
                </label>
                <select
                  required
                  value={offlineMemberId}
                  onChange={(e) => setOfflineMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                >
                  <option value="">-- Pilih Nama Member / Pelanggan --</option>
                  {allCustomers.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.nama} ({m.noHp || m.email}) • {m.isMember ? '⭐ Member' : 'Pelanggan'} • {m.poin || 0} PTS
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Pilih Menu Kopi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-stone-100 rounded-2xl border border-stone-200">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddOfflineItem(p)}
                      className="p-2 bg-white hover:bg-amber-50 rounded-xl border border-stone-200 text-left transition flex flex-col justify-between"
                    >
                      <div className="font-bold text-[11px] text-stone-900 line-clamp-1">{p.nama}</div>
                      <div className="text-[10px] font-black text-amber-900 mt-1">
                        {formatRupiah(p.harga)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Items List */}
              {offlineItems.length > 0 && (
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-xs text-stone-700 uppercase">Item Terpilih</div>
                  {offlineItems.map((it) => (
                    <div
                      key={it.product.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-none"
                    >
                      <div>
                        <div className="font-bold text-stone-800">{it.product.nama}</div>
                        <div className="text-[10px] text-stone-400">
                          {formatRupiah(it.product.harga)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateOfflineQty(it.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-900">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateOfflineQty(it.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-stone-800 w-20 text-right">
                          {formatRupiah(it.product.harga * it.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={offlinePayment}
                    onChange={(e) => setOfflinePayment(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="cod">Tunai di Kasir (Cash)</option>
                    <option value="qris">QRIS Statis Kasir</option>
                    <option value="transfer">Debit / EDC Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Catatan Kasir
                  </label>
                  <input
                    type="text"
                    value={offlineNotes}
                    onChange={(e) => setOfflineNotes(e.target.value)}
                    placeholder="Contoh: Meja 04 / Takeaway..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-600 block">Total Tagihan Kasir</span>
                  <span className="text-lg font-black text-amber-950">
                    {formatRupiah(offlineTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-600 block">Poin Bertambah ke Member</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    +{offlinePoints} Poin Loyalty
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingOffline || offlineItems.length === 0 || !offlineMemberId}
                className="w-full py-3 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingOffline ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Simpan Transaksi &amp; Tambahkan Poin
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
