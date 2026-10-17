import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Phone,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { updateOrderStatus } from '../../services/dbService';
import { formatRupiah, formatDate, getStatusBadge } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminOrdersProps {
  orders: Order[];
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders }) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterSource, setFilterSource] = useState<string>('Semua');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status Change Confirmation
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    order: Order;
    newStatus: OrderStatus;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statuses: OrderStatus[] = ['Menunggu', 'Diproses', 'Selesai', 'Dibatalkan'];

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      (o.userPhone && o.userPhone.includes(search));

    const matchStatus = filterStatus === 'Semua' || o.status === filterStatus;
    const matchSource = filterSource === 'Semua' || o.sumber === filterSource;

    return matchSearch && matchStatus && matchSource;
  });

  const handlePromptStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (order.status === newStatus) return;
    setStatusChangeTarget({ order, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsUpdatingStatus(true);
    const { order, newStatus } = statusChangeTarget;

    try {
      await updateOrderStatus(order.id, newStatus);
      if (newStatus === 'Selesai') {
        showToast(
          `Pesanan #${order.id.slice(0, 6)} diselesaikan! Poin otomatis dikreditkan jika member.`,
          'success',
          'Status Diperbarui'
        );
      } else {
        showToast(`Status pesanan diubah ke "${newStatus}"`, 'info');
      }
      setStatusChangeTarget(null);
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Kelola Pesanan Masuk ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Periksa pesanan baru, ubah status pesanan, dan verifikasi pemberian poin member
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID pesanan, nama konsumen, atau no HP..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white"
            >
              <option value="Semua">Semua Sumber</option>
              <option value="online">Online App</option>
              <option value="offline">Kasir Offline</option>
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['Semua', ...statuses].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === st
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">ID &amp; Tanggal</th>
                <th className="py-3.5 px-4">Konsumen</th>
                <th className="py-3.5 px-4">Detail Kopi</th>
                <th className="py-3.5 px-4">Total &amp; Bayar</th>
                <th className="py-3.5 px-4">Status Pesanan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-stone-400">
                    Tidak ada pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">#{order.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-stone-400">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-800">{order.userName}</div>
                        <div className="text-[10px] text-stone-400">{order.userPhone || '-'}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="line-clamp-2 text-stone-700">
                          {order.items?.map((it) => `${it.jumlah}x ${it.nama}`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-amber-950 text-sm">
                          {formatRupiah(order.total)}
                        </div>
                        <div className="text-[10px] text-stone-500 font-semibold uppercase">
                          {order.metodeBayar} • {order.sumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          {/* Quick Status Next Button */}
                          {order.status === 'Menunggu' && (
                            <button
                              onClick={() => handlePromptStatusChange(order, 'Diproses')}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                            >
                              Proses
                            </button>
                          )}
                          {order.status === 'Diproses' && (
                            <button
                              onClick={() => handlePromptStatusChange(order, 'Selesai')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                            >
                              Selesaikan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF5EE] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200/50 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Detail Transaksi
              </span>
              <h2 className="text-xl font-black text-stone-900">
                Pesanan #{selectedOrder.id.slice(0, 8)}
              </h2>
              <div className="text-xs text-stone-400 mt-0.5">
                {formatDate(selectedOrder.createdAt)} • Sumber: {selectedOrder.sumber}
              </div>
            </div>

            {/* Customer Box */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1 mb-4">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{selectedOrder.userName}</span>
              </div>
              {selectedOrder.userPhone && (
                <div className="text-stone-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedOrder.userPhone}</span>
                </div>
              )}
              {selectedOrder.userAddress && (
                <div className="text-stone-600 flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{selectedOrder.userAddress}</span>
                </div>
              )}
              {selectedOrder.catatan && (
                <div className="mt-2 pt-2 border-t border-stone-100 text-stone-700 flex items-start gap-1.5 bg-amber-50/50 p-2 rounded-xl">
                  <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block text-[10px] uppercase tracking-wider">Catatan Konsumen:</strong>
                    <span className="italic">{selectedOrder.catatan}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2.5 mb-4 text-xs">
              <div className="font-bold text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                Daftar Minuman / Menu
              </div>
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900">{it.jumlah}x {it.nama}</span>
                    <span className="text-stone-400 text-[10px] block">
                      @{formatRupiah(it.harga)}
                    </span>
                  </div>
                  <span className="font-semibold text-stone-800">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}

              <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline font-black text-sm text-stone-900">
                <span>Total Belanja:</span>
                <span className="text-amber-950 text-base">{formatRupiah(selectedOrder.total)}</span>
              </div>

              <div className="flex justify-between text-xs text-amber-800 font-bold bg-amber-50 p-2 rounded-xl">
                <span>Poin Member:</span>
                <span>+{selectedOrder.poinDidapat} PTS (Saat selesai)</span>
              </div>
            </div>

            {/* Status Changer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Ubah Status Pesanan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handlePromptStatusChange(selectedOrder, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      selectedOrder.status === st
                        ? 'bg-[#4A2E18] text-white border-transparent shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {statusChangeTarget && (
        <ConfirmModal
          isOpen={Boolean(statusChangeTarget)}
          onClose={() => setStatusChangeTarget(null)}
          onConfirm={handleConfirmStatusChange}
          title={`Ubah Status ke "${statusChangeTarget.newStatus}"?`}
          message={
            statusChangeTarget.newStatus === 'Selesai'
              ? `Pesanan akan ditandai selesai. Jika konsumen adalah Member resmi, poin loyalitas (+${statusChangeTarget.order.poinDidapat} PTS) akan otomatis ditambahkan ke akun konsumen!`
              : `Status pesanan #${statusChangeTarget.order.id.slice(0, 6)} akan diubah menjadi ${statusChangeTarget.newStatus}.`
          }
          confirmLabel={`Ya, Ubah ke ${statusChangeTarget.newStatus}`}
          isLoading={isUpdatingStatus}
        />
      )}
    </div>
  );
};
