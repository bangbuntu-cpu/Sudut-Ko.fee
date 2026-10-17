import React, { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Coffee,
  Calendar,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Order, UserProfile, Product } from '../../types';
import { formatRupiah, formatDate, getStatusBadge } from '../../utils/format';

interface AdminDashboardProps {
  orders: Order[];
  users: UserProfile[];
  products: Product[];
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  users,
  products,
  onNavigateToTab
}) => {
  // Metrics calculation
  const metrics = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.status !== 'Dibatalkan')
      .reduce((sum, o) => sum + o.total, 0);

    const membersCount = users.filter((u) => u.isMember).length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.createdAt?.slice(0, 10) === todayStr);
    const todaySales = todayOrders
      .filter((o) => o.status !== 'Dibatalkan')
      .reduce((sum, o) => sum + o.total, 0);

    // Bestseller ranking
    const salesMap: { [name: string]: { count: number; total: number } } = {};
    orders
      .filter((o) => o.status !== 'Dibatalkan')
      .forEach((o) => {
        o.items?.forEach((it) => {
          if (!salesMap[it.nama]) {
            salesMap[it.nama] = { count: 0, total: 0 };
          }
          salesMap[it.nama].count += it.jumlah;
          salesMap[it.nama].total += it.subtotal;
        });
      });

    const bestsellers = Object.entries(salesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sales by last 7 days for the chart
    const last7Days: { date: string; label: string; amount: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);

      const dayTotal = orders
        .filter((o) => o.createdAt?.slice(0, 10) === dStr && o.status !== 'Dibatalkan')
        .reduce((sum, o) => sum + o.total, 0);

      const dayCount = orders.filter(
        (o) => o.createdAt?.slice(0, 10) === dStr && o.status !== 'Dibatalkan'
      ).length;

      last7Days.push({ date: dStr, label: dayLabel, amount: dayTotal, count: dayCount });
    }

    const maxDayAmount = Math.max(...last7Days.map((d) => d.amount), 50000);

    return {
      totalSales,
      membersCount,
      todayOrdersCount: todayOrders.length,
      todaySales,
      totalOrdersCount: orders.length,
      bestsellers,
      last7Days,
      maxDayAmount
    };
  }, [orders, users]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#3B2215] to-[#25130A] text-white p-6 rounded-3xl border border-amber-900/40 shadow-lg">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Ringkasan Performa Kafe
          </span>
          <h1 className="text-2xl font-black tracking-tight">Dashboard Manajemen SUDUT KO.FEE</h1>
          <p className="text-xs text-stone-300 mt-1">
            Pantau arus transaksi kasir, online, anggota member, dan pergerakan stok secara realtime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Semua Pesanan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Omzet</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {formatRupiah(metrics.totalSales)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Semua pesanan berhasil</span>
          </div>
        </div>

        {/* Card 2: Registered Members */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Member</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {metrics.membersCount}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-1">
            dari {users.length} total akun terdaftar
          </div>
        </div>

        {/* Card 3: Today's Orders */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Transaksi Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {metrics.todayOrdersCount}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-1">
            Omzet: {formatRupiah(metrics.todaySales)}
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pesanan</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            {metrics.totalOrdersCount}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-1">
            Online &amp; Kasir Offline
          </div>
        </div>
      </div>

      {/* Charts & Bestsellers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Tren Penjualan 7 Hari Terakhir</h2>
              <p className="text-xs text-stone-500 mt-0.5">Pendapatan harian dari pesanan aktif</p>
            </div>
            <div className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              7 Hari Terakhir
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 sm:h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-stone-100">
            {metrics.last7Days.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.amount / metrics.maxDayAmount) * 100));

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-amber-200 text-[10px] font-bold px-2 py-1 rounded shadow -mb-1 pointer-events-none whitespace-nowrap z-10">
                    {formatRupiah(day.amount)} ({day.count} order)
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-[#4A2E18] to-amber-600 rounded-t-xl group-hover:from-amber-700 group-hover:to-amber-500 transition-all duration-300 relative shadow-xs"
                  />
                  <span className="text-[11px] font-bold text-stone-600 uppercase">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
            <span>Rata-rata: {formatRupiah(Math.round(metrics.totalSales / Math.max(1, orders.length)))} / order</span>
            <span className="font-semibold text-stone-700">Skala Maksimum: {formatRupiah(metrics.maxDayAmount)}</span>
          </div>
        </div>

        {/* Bestseller Coffee Ranking (1 Col) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-stone-900">Produk Terlaris</h2>
              <Coffee className="w-4 h-4 text-amber-700" />
            </div>

            {metrics.bestsellers.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                Belum ada data penjualan tercatat.
              </div>
            ) : (
              <div className="space-y-3.5">
                {metrics.bestsellers.map((item, idx) => {
                  const maxCount = metrics.bestsellers[0].count || 1;
                  const percent = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-stone-800 truncate max-w-[140px]">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-black text-amber-900">{item.count} cup</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="bg-amber-700 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('reports')}
            className="w-full mt-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition flex items-center justify-center gap-1.5"
          >
            <span>Buka Laporan Penjualan Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">Pesanan Terbaru</h2>
            <p className="text-xs text-stone-500">Aktivitas pesanan online dan kasir offline terkini</p>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950"
          >
            Kelola Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                <th className="pb-3">ID &amp; Waktu</th>
                <th className="pb-3">Konsumen</th>
                <th className="pb-3">Item Kopi</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Sumber</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-stone-50 transition">
                    <td className="py-3">
                      <div className="font-bold text-stone-900">#{order.id.slice(0, 6)}</div>
                      <div className="text-[10px] text-stone-400">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="py-3 font-semibold text-stone-800">
                      {order.userName}
                    </td>
                    <td className="py-3 text-stone-600">
                      {order.items?.map((i) => `${i.jumlah}x ${i.nama}`).join(', ')}
                    </td>
                    <td className="py-3 font-bold text-amber-950">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {order.sumber}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
