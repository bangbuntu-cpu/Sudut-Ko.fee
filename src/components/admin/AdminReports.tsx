import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDate, getStatusBadge } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

interface AdminReportsProps {
  orders: Order[];
}

export const AdminReports: React.FC<AdminReportsProps> = ({ orders }) => {
  const { showToast } = useToast();

  const [period, setPeriod] = useState<'today' | 'last7' | 'thisMonth' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderDateStr = o.createdAt.slice(0, 10);

      if (period === 'today') {
        return orderDateStr === todayStr;
      }
      if (period === 'last7') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return new Date(o.createdAt) >= d;
      }
      if (period === 'thisMonth') {
        const currentMonth = todayStr.slice(0, 7);
        return orderDateStr.startsWith(currentMonth);
      }
      if (period === 'custom') {
        if (startDate && orderDateStr < startDate) return false;
        if (endDate && orderDateStr > endDate) return false;
        return true;
      }
      return true;
    });
  }, [orders, period, startDate, endDate]);

  const stats = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.status !== 'Dibatalkan');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = validOrders.filter((o) => o.status === 'Selesai');
    const totalPointsGiven = completedOrders.reduce((sum, o) => sum + (o.poinDidapat || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

    // Payment methods breakdown
    const paymentBreakdown: { [method: string]: number } = { qris: 0, transfer: 0, cod: 0 };
    validOrders.forEach((o) => {
      paymentBreakdown[o.metodeBayar] = (paymentBreakdown[o.metodeBayar] || 0) + o.total;
    });

    return {
      totalRevenue,
      totalOrders: validOrders.length,
      completedOrdersCount: completedOrders.length,
      totalPointsGiven,
      avgOrderValue,
      paymentBreakdown
    };
  }, [filteredOrders]);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor', 'warning');
      return;
    }

    const headers = ['ID Pesanan', 'Tanggal', 'Nama Pelanggan', 'No HP', 'Metode Bayar', 'Sumber', 'Total (Rp)', 'Status', 'Poin'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.createdAt,
      `"${o.userName}"`,
      `"${o.userPhone || ''}"`,
      o.metodeBayar,
      o.sumber,
      o.total,
      o.status,
      o.poinDidapat
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-penjualan-sudutkofee-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Laporan berhasil diekspor ke format CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Laporan Penjualan &amp; Rekapitulasi
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Analisis pendapatan kotor, jumlah pesanan, dan loyalitas poin per periode
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Semua Waktu' },
            { id: 'today', label: 'Hari Ini' },
            { id: 'last7', label: '7 Hari Terakhir' },
            { id: 'thisMonth', label: 'Bulan Ini' },
            { id: 'custom', label: 'Rentang Kustom' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                period === p.id
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500">Mulai:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-xl bg-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-xl bg-white text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Total Omzet Periode
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-950">
            {formatRupiah(stats.totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats.totalOrders} Transaksi Sukses
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Rata-rata Transaksi (AOV)
          </span>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {formatRupiah(stats.avgOrderValue)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">per nota belanja</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Pesanan Selesai
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {stats.completedOrdersCount}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">selesai disajikan</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Poin Loyalty Diberikan
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            +{stats.totalPointsGiven} PTS
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">ke akun Member</span>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <h3 className="font-extrabold text-sm text-stone-900 mb-4">
          Sebaran Omzet Berdasarkan Metode Pembayaran
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">QRIS Digital</span>
            <div className="text-lg font-black text-stone-900">
              {formatRupiah(stats.paymentBreakdown['qris'] || 0)}
            </div>
          </div>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">Transfer Bank / VA</span>
            <div className="text-lg font-black text-stone-900">
              {formatRupiah(stats.paymentBreakdown['transfer'] || 0)}
            </div>
          </div>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">Tunai di Kasir / COD</span>
            <div className="text-lg font-black text-stone-900">
              {formatRupiah(stats.paymentBreakdown['cod'] || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
            Rincian Transaksi ({filteredOrders.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Konsumen</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Sumber</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    Tidak ada data transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const badge = getStatusBadge(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 px-4 text-stone-500">{formatDate(o.createdAt)}</td>
                      <td className="py-3 px-4 font-bold text-stone-800">{o.userName}</td>
                      <td className="py-3 px-4 font-black text-amber-950">{formatRupiah(o.total)}</td>
                      <td className="py-3 px-4 uppercase font-semibold text-stone-600">{o.metodeBayar}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-stone-500">{o.sumber}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
