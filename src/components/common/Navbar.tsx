import React, { useState } from 'react';
import {
  Coffee,
  ShoppingCart,
  Award,
  User,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { AuthModal } from '../auth/AuthModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminView,
  setIsAdminView,
  onOpenCart
}) => {
  const { currentUser, userProfile, isAdmin, isMember, logout } = useAuth();
  const { totalItems } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF5EE]/95 backdrop-blur-md border-b border-amber-900/10 text-[#2C1810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsAdminView(false);
                  setActiveTab('catalog');
                }}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#4A2E18] to-[#2B170B] flex items-center justify-center text-[#E5BA73] shadow-md shadow-amber-950/20 group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2C1810] flex items-center gap-1.5">
                    SUDUT KO.FEE
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  </span>
                  <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-amber-800/80 -mt-1">
                    BEANS &amp; REWARS
                  </span>
                </div>
              </button>

              {/* Mode Admin Badge on Header */}
              {isAdmin && (
                <button
                  onClick={() => setIsAdminView(!isAdminView)}
                  className={`ml-2 px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isAdminView
                      ? 'bg-amber-800 text-amber-100 border-amber-700 shadow-sm'
                      : 'bg-stone-200/80 hover:bg-stone-300 text-stone-700 border-stone-300'
                  }`}
                  title="Klik untuk beralih antara tampilan Konsumen dan Panel Admin"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">
                    {isAdminView ? 'Mode Admin Aktif' : 'Masuk Panel Admin'}
                  </span>
                  <span className="md:hidden">{isAdminView ? 'Admin' : 'Toko'}</span>
                </button>
              )}
            </div>

            {/* Desktop Navigation Links */}
            {!isAdminView && (
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-[#4A2E18] text-[#FAF5EE] shadow-sm'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-amber-900/5'
                  }`}
                >
                  Katalog Kopi
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'rewards'
                      ? 'bg-[#4A2E18] text-[#FAF5EE] shadow-sm'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-amber-900/5'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  Tukar Poin
                  {isMember && (
                    <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500 text-amber-950 font-black">
                      {userProfile?.poin || 0}
                    </span>
                  )}
                </button>
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'orders'
                        ? 'bg-[#4A2E18] text-[#FAF5EE] shadow-sm'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-amber-900/5'
                    }`}
                  >
                    Pesanan Saya
                  </button>
                )}
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'account'
                        ? 'bg-[#4A2E18] text-[#FAF5EE] shadow-sm'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-amber-900/5'
                    }`}
                  >
                    Kartu Member
                  </button>
                )}
              </nav>
            )}

            {/* Actions: Member Points / Cart / User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Member Point Pill */}
              {isMember && !isAdminView && (
                <button
                  onClick={() => setActiveTab('rewards')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200/80 border border-amber-300 text-amber-900 text-xs font-bold hover:shadow-sm transition"
                  title="Poin loyalitas Anda. Klik untuk tukar hadiah!"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  <span>{userProfile?.poin || 0} Poin</span>
                </button>
              )}

              {/* Cart Button */}
              {!isAdminView && (
                <button
                  onClick={onOpenCart}
                  className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-700/40 text-stone-800 hover:text-amber-900 shadow-sm transition-all flex items-center gap-2"
                  aria-label="Buka Keranjang Belanja"
                >
                  <ShoppingCart className="w-5 h-5 text-amber-800" />
                  <span className="hidden sm:inline text-xs font-bold">Keranjang</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 sm:static sm:top-0 sm:right-0 bg-amber-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              {/* User Dropdown / Login */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center text-xs font-bold">
                      {userProfile?.nama?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <div className="font-bold text-stone-900 max-w-[100px] truncate">
                        {userProfile?.nama || 'Akun'}
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold">
                        {userProfile?.role === 'admin'
                          ? 'Admin'
                          : userProfile?.isMember
                          ? 'Member'
                          : 'Konsumen'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <div className="font-bold text-sm text-stone-900">
                          {userProfile?.nama}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {userProfile?.email}
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => setIsAdminView(!isAdminView)}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          {isAdminView ? 'Beralih ke Toko' : 'Buka Dashboard Admin'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsAdminView(false);
                          setActiveTab('account');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        Profil &amp; Kartu Member
                      </button>

                      <button
                        onClick={() => {
                          setIsAdminView(false);
                          setActiveTab('rewards');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        Tukar Hadiah ({userProfile?.poin || 0} Poin)
                      </button>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 transition-all flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
