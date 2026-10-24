import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Award,
  X,
  Search
} from 'lucide-react';
import { Reward } from '../../types';
import { addReward, updateReward, deleteReward } from '../../services/dbService';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminRewardsProps {
  rewards: Reward[];
}

export const AdminRewards: React.FC<AdminRewardsProps> = ({ rewards }) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
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

  const filtered = rewards.filter((r) =>
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Kelola Produk Reward ({rewards.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Atur hadiah merchandise atau kopi gratis yang dapat ditukarkan member menggunakan poin
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Reward Baru</span>
        </button>
      </div>

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
        {filtered.map((rew) => (
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
                <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1">{rew.nama}</h3>
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
                className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setRewardToDelete(rew)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Hapus reward"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition"
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
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4A2E18] hover:bg-[#382110] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
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
