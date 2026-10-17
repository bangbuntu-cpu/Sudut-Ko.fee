import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Coffee,
  Search,
  Filter,
  X,
  Check,
  Image,
  AlertTriangle
} from 'lucide-react';
import { Product } from '../../types';
import { addProduct, updateProduct, deleteProduct } from '../../services/dbService';
import { formatRupiah } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminProductsProps {
  products: Product[];
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products }) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Signature');
  const [harga, setHarga] = useState<number | ''>('');
  const [stok, setStok] = useState<number | ''>('');
  const [gambar, setGambar] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ['Signature', 'Espresso Based', 'Manual Brew', 'Cold Brew', 'Non-Coffee / Pastry'];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setNama('');
    setKategori('Signature');
    setHarga('');
    setStok('');
    setGambar('https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop');
    setDeskripsi('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setNama(p.nama);
    setKategori(p.kategori);
    setHarga(p.harga);
    setStok(p.stok);
    setGambar(p.gambar);
    setDeskripsi(p.deskripsi);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || harga === '' || stok === '') {
      showToast('Mohon lengkapi semua data produk', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          nama: nama.trim(),
          kategori,
          harga: Number(harga),
          stok: Number(stok),
          gambar: gambar.trim() || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop',
          deskripsi: deskripsi.trim()
        });
        showToast(`Produk "${nama}" berhasil diperbarui`, 'success');
      } else {
        await addProduct({
          nama: nama.trim(),
          kategori,
          harga: Number(harga),
          stok: Number(stok),
          gambar: gambar.trim() || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop',
          deskripsi: deskripsi.trim()
        });
        showToast(`Produk "${nama}" berhasil ditambahkan ke katalog`, 'success');
      }
      setShowModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan produk', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Produk "${productToDelete.nama}" telah dihapus`, 'success');
      setProductToDelete(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus produk', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || p.kategori === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Kelola Produk Kopi ({products.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tambah, perbarui harga, ketersediaan stok, dan foto menu kopi kafe
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kopi Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kopi atau deskripsi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['Semua', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCategory === c
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Menu Kopi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4">Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-stone-400">
                    Tidak ada produk kopi ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.gambar}
                          alt={prod.nama}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{prod.nama}</div>
                          <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                            {prod.deskripsi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        {prod.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-950 text-sm">
                      {formatRupiah(prod.harga)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                          prod.stok <= 0
                            ? 'bg-red-100 text-red-700'
                            : prod.stok < 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stok <= 0 ? 'Habis (0)' : `${prod.stok} unit`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-xl transition"
                          title="Edit produk"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Hapus produk"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Form Modal (Add / Edit) */}
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
              {editingProduct ? 'Edit Menu Kopi' : 'Tambah Produk Kopi Baru'}
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Isi data detail kopi untuk ditampilkan pada katalog konsumen
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Kopi Susu Aren"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={harga}
                    onChange={(e) => setHarga(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="25000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Stok Porsi</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stok}
                  onChange={(e) => setStok(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto Kopi</label>
                <input
                  type="url"
                  required
                  value={gambar}
                  onChange={(e) => setGambar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
                {gambar && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                    <img src={gambar} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi &amp; Tasting Notes</label>
                <textarea
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ceritakan cita rasa, asal biji kopi, tingkat manis/asam..."
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
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <ConfirmModal
          isOpen={Boolean(productToDelete)}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Hapus Produk Kopi?"
          message={`Apakah Anda yakin ingin menghapus "${productToDelete.nama}" dari katalog? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus Produk"
          isDestructive
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
