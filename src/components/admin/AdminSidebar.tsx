import React from 'react';
import {
  LayoutDashboard,
  Coffee,
  Gift,
  ShoppingBag,
  Users,
  Settings,
  BarChart3,
  Store,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onExitAdmin: () => void;
  onOpenOfflineOrderModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  setCurrentTab,
  onExitAdmin,
  onOpenOfflineOrderModal
}) => {
  const { logout, userProfile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Kelola Pesanan', icon: ShoppingBag },
    { id: 'products', label: 'Produk Kopi', icon: Coffee },
    { id: 'rewards', label: 'Produk Reward', icon: Gift },
    { id: 'members', label: 'Kelola Member', icon: Users },
    { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
    { id: 'settings', label: 'Aturan Poin & Toko', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#2C1810] text-[#FAF5EE] lg:min-h-screen flex flex-col justify-between shrink-0 shadow-xl border-r border-amber-950">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white">SUDUT KO.FEE</h2>
              <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
                Panel Manajemen
              </span>
            </div>
          </div>
        </div>

        {/* Quick Offline Transaction Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onOpenOfflineOrderModal}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Transaksi Offline</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1 lg:gap-1.5 no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Exit Admin & Profile */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-stone-200 transition"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>Beralih ke Tampilan Toko</span>
        </button>

        <div className="pt-2 flex items-center justify-between text-xs text-stone-400">
          <div className="truncate max-w-[140px]">
            <div className="font-bold text-stone-200 truncate">{userProfile?.nama || 'Admin'}</div>
            <div className="text-[10px] text-amber-400">Super Administrator</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg transition"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
