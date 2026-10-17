import React from 'react';
import { Coffee, ShoppingCart, Award, User, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isAdminView,
  setIsAdminView,
  onOpenCart
}) => {
  const { totalItems } = useCart();
  const { isAdmin, userProfile } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EE]/95 backdrop-blur-md border-t border-amber-900/10 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-4 items-center gap-1">
        {/* Tab 1: Menu Kopi */}
        <button
          onClick={() => {
            setIsAdminView(false);
            setActiveTab('catalog');
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            !isAdminView && activeTab === 'catalog'
              ? 'text-amber-900 font-bold bg-amber-200/40'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Coffee className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Katalog</span>
        </button>

        {/* Tab 2: Keranjang */}
        <button
          onClick={() => {
            setIsAdminView(false);
            onOpenCart();
          }}
          className="relative flex flex-col items-center justify-center py-1.5 rounded-xl text-stone-500 hover:text-stone-800 transition-all"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Keranjang</span>
        </button>

        {/* Tab 3: Tukar Poin */}
        <button
          onClick={() => {
            setIsAdminView(false);
            setActiveTab('rewards');
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            !isAdminView && activeTab === 'rewards'
              ? 'text-amber-900 font-bold bg-amber-200/40'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Award className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] mt-0.5">
            Poin {userProfile?.poin ? `(${userProfile.poin})` : ''}
          </span>
        </button>

        {/* Tab 4: Akun or Admin Panel */}
        {isAdmin ? (
          <button
            onClick={() => {
              setIsAdminView(!isAdminView);
              if (!isAdminView) setActiveTab('admin_dashboard');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              isAdminView
                ? 'text-amber-900 font-bold bg-amber-200/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield className="w-5 h-5 text-amber-700" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('account');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              !isAdminView && activeTab === 'account'
                ? 'text-amber-900 font-bold bg-amber-200/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Akun</span>
          </button>
        )}
      </div>
    </div>
  );
};
