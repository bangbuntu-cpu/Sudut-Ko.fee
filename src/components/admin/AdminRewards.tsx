import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Award,
  X,
  Search,
  RefreshCw,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Filter
} from 'lucide-react';
import { Reward, Redemption } from '../../types';
import {
  addReward,
  updateReward,
  deleteReward,
  syncWithSpreadsheet,
  subscribeAllRedemptions,
  updateRedemptionStatus
} from '../../services/dbService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminRewardsProps {
  rewards: Reward[];
}

export const AdminRewards: React.FC<AdminRewardsProps> = ({ rewards }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'redemptions'>('catalog');

  // Rewards catalog state
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [nama, setNama] = useState('');
  const [poinDibutuhkan, setPoinDibutuhkan] = useState<number | ''>('');
  const [stok, setStok] = useState<number | ''>('');
  const [gambar, setGambar] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redemptions state
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [redemptionSearch, setRedemptionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [updatingRedemptionId, setUpdatingRedemptionId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAllRedemptions((list) => {
      setRedemptions(list);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingReward(null);
    setNama('');
    setPoinDibutuhkan(15);
    setStok(20);
    setGambar('https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop');
    setDeskripsi('');
    setShowModal(true);
  };

  const handleOpenEdit = (r: Reward) => {
    setEditingReward(r);
    setNama(String(r.nama || ''));
    setPoinDibutuhkan(r.poinDibutuhkan);
    setStok(r.stok);
    setGambar(String(r.gambar || ''));
    setDeskripsi(String(r.deskripsi || ''));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = String(nama || '').trim();
    const cleanGambar = String(gambar || '').trim();
    const cleanDeskripsi = String(deskripsi || '').trim();

    if (!cleanNama || poinDibutuhkan === '' || stok === '') {
      showToast('Harap lengkapi semua isian reward', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReward) {
        await updateReward(editingReward.id, {
          nama: cleanNama,
          poinDibutuhkan: Number(poinDibutuhkan),
          stok: Number(stok),
          gambar: cleanGambar,
          deskripsi: cleanDeskripsi
        });
        showToast(`Reward "${cleanNama}" berhasil diubah`, 'success');
      } else {
        await addReward({
          nama: cleanNama,
          poinDibutuhkan: Number(poinDibutuhkan),
          stok: Number(stok),
          gambar: cleanGambar || 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=600&auto=format&fit=crop',
          deskripsi: cleanDeskripsi
        });
        showToast(`Reward "${cleanNama}" berhasil ditambahkan`, 'success');
      }
      setShowModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan reward', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!rewardToDelete) return;
    setIsDeleting(true);
    try {
      await deleteReward(rewardToDelete.id);
      showToast(`Reward "${rewardToDelete.nama}" telah dihapus`, 'success');
      setRewardToDelete(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus reward', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeRedemptionStatus = async (
    id: string,
    newStatus: 'Menunggu' | 'Selesai' | 'Dibatalkan'
  ) => {
    setUpdatingRedemptionId(id);
    try {
      await updateRedemptionStatus(id, newStatus);
      showToast(`Status penukaran berhasil diperbarui menjadi "${newStatus}"`, 'success');
    } catch {
      showToast('Gagal mengubah status penukaran', 'error');
    } finally {
      setUpdatingRedemptionId(null);
    }
  };

  const filteredRewards = rewards.filter((r) =>
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRedemptions = redemptions.filter((rdm) => {
    const matchSearch =
      (rdm.userName || '').toLowerCase().includes(redemptionSearch.toLowerCase()) ||
      (rdm.namaReward || '').toLowerCase().includes(redemptionSearch.toLowerCase()) ||
      (rdm.userId || '').toLowerCase().includes(redemptionSearch.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || rdm.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Penukaran &amp; Produk Reward
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola katalog reward serta pantau klaim penukaran poin langsung dari konsumen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              setIsSyncing(true);
              try {
                await syncWithSpreadsheet();
                showToast('Data reward & penukaran berhasil disinkronkan!', 'success');
              } catch {
                showToast('Gagal menyinkronkan data dengan spreadsheet', 'error');
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Tarik data terbaru dari Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan data'}</span>
          </button>

          {activeTab === 'catalog' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Reward Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-[#4A2E18] text-white shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Katalog &amp; Stok Reward ({rewards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('redemptions')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'redemptions'
              ? 'bg-[#4A2E18] text-white shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <History className="w-4 h-4 text-amber-500" />
          <span>Riwayat Penukaran Poin</span>
          {redemptions.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'redemptions'
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {redemptions.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: KATALOG REWARD */}
      {activeTab === 'catalog' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama hadiah atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredRewards.map((rew) => (
              <div
                key={rew.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={rew.gambar}
                      alt={rew.nama}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-600 text-white shadow flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> {rew.poinDibutuhkan} Poin
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1">
                      {rew.nama}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {rew.deskripsi}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                      <span className="text-stone-400">Stok:</span>
                      <span className="font-bold text-stone-800">{rew.stok} unit</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-stone-50">
                  <button
                    onClick={() => handleOpenEdit(rew)}
                    className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setRewardToDelete(rew)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Hapus reward"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: RIWAYAT PENUKARAN POIN KONSUMEN */}
      {activeTab === 'redemptions' && (
        <div className="space-y-4">
          {/* Summary Stat Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block font-medium">Total Penukaran</span>
                <span className="text-lg font-black text-stone-900">{redemptions.length} Klaim</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block font-medium">Poin Terpakai Member</span>
                <span className="text-lg font-black text-emerald-950">
                  {redemptions.reduce((sum, r) => sum + (r.poinDipakai || 0), 0)} Poin
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block font-medium">Penukaran Selesai</span>
                <span className="text-lg font-black text-stone-900">
                  {redemptions.filter((r) => r.status === 'Selesai').length} Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={redemptionSearch}
                onChange={(e) => setRedemptionSearch(e.target.value)}
                placeholder="Cari nama konsumen atau nama hadiah..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-stone-500 font-bold shrink-0">
                <Filter className="w-3.5 h-3.5" /> Status:
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="Semua">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Menunggu">Menunggu Klaim</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Redemptions Table List */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            {filteredRedemptions.length === 0 ? (
              <div className="text-center py-12 p-6">
                <Gift className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-800">Belum Ada Penukaran Poin</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Belum ada klaim penukaran hadiah dari konsumen yang sesuai dengan pencarian atau filter Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px] text-stone-500">
                    <tr>
                      <th className="py-3 px-4">Waktu Klaim</th>
                      <th className="py-3 px-4">Konsumen / Member</th>
                      <th className="py-3 px-4">Hadiah / Reward</th>
                      <th className="py-3 px-4">Poin Terpakai</th>
                      <th className="py-3 px-4">Status Penukaran</th>
                      <th className="py-3 px-4 text-right">Aksi Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRedemptions.map((rdm) => {
                      const isUpdating = updatingRedemptionId === rdm.id;

                      return (
                        <tr key={rdm.id} className="hover:bg-stone-50/80 transition">
                          <td className="py-3.5 px-4 font-medium text-stone-500 whitespace-nowrap">
                            {formatDate(rdm.createdAt)}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-stone-900 block">
                                  {rdm.userName || 'Konsumen'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  ID: {rdm.userId}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-stone-900 flex items-center gap-1.5">
                              <Gift className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              {rdm.namaReward}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 inline-flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-700" />
                              {rdm.poinDipakai} Poin
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {rdm.status === 'Selesai' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Selesai
                              </span>
                            )}
                            {rdm.status === 'Menunggu' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" /> Menunggu Klaim
                              </span>
                            )}
                            {rdm.status === 'Dibatalkan' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-900 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-700" /> Dibatalkan
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={rdm.status}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleChangeRedemptionStatus(
                                  rdm.id,
                                  e.target.value as 'Menunggu' | 'Selesai' | 'Dibatalkan'
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-700 cursor-pointer disabled:opacity-50"
                            >
                              <option value="Selesai">Selesai (Diambil)</option>
                              <option value="Menunggu">Menunggu Klaim</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-stone-900 mb-1">
              {editingReward ? 'Edit Hadiah Reward' : 'Tambah Hadiah Baru'}
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Tentukan jumlah poin yang diperlukan member untuk menukarkan hadiah ini
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Reward</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Tumbler Stainless 500ml"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Poin Dibutuhkan</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={poinDibutuhkan}
                    onChange={(e) => setPoinDibutuhkan(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Stok Hadiah</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stok}
                    onChange={(e) => setStok(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto Hadiah</label>
                <input
                  type="url"
                  required
                  value={gambar}
                  onChange={(e) => setGambar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi Reward</label>
                <textarea
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan spesifikasi hadiah atau voucher..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4A2E18] hover:bg-[#382110] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Simpan Hadiah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {rewardToDelete && (
        <ConfirmModal
          isOpen={Boolean(rewardToDelete)}
          onClose={() => setRewardToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Hapus Produk Reward?"
          message={`Apakah Anda yakin ingin menghapus "${rewardToDelete.nama}"? Member tidak akan dapat menukarkan reward ini lagi.`}
          confirmLabel="Hapus Reward"
          isDestructive
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
