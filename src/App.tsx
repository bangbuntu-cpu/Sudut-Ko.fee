/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { ProductCatalog } from './components/user/ProductCatalog';
import { RewardsView } from './components/user/RewardsView';
import { AccountView } from './components/user/AccountView';
import { CartDrawer } from './components/user/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminRewards } from './components/admin/AdminRewards';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminMembers } from './components/admin/AdminMembers';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import {
  subscribeProducts,
  subscribeRewards,
  subscribeAllOrders,
  subscribeAllUsers,
  subscribeStoreSettings,
  seedDatabaseIfEmpty,
  cleanupAllDemoData,
  syncWithSpreadsheet
} from './services/dbService';
import { Product, Reward, Order, UserProfile, StoreSettings } from './types';
import { DEFAULT_SETTINGS } from './services/seedData';
import { Coffee, Sparkles } from 'lucide-react';

function MainAppContent() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOpenOfflineModal, setIsOpenOfflineModal] = useState<boolean>(false);

  // Global synchronized data
  const [products, setProducts] = useState<Product[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Synchronize live data from Google Spreadsheet on initial load and window focus
  useEffect(() => {
    syncWithSpreadsheet().catch((err) => {
      console.warn('Initial spreadsheet sync error:', err);
    });

    const handleFocus = () => {
      syncWithSpreadsheet().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Subscribe to public catalog data
  useEffect(() => {
    const unsubProducts = subscribeProducts(setProducts);
    const unsubRewards = subscribeRewards(setRewards);
    const unsubSettings = subscribeStoreSettings(setStoreSettings);

    return () => {
      unsubProducts();
      unsubRewards();
      unsubSettings();
    };
  }, []);

  // Admin-only listeners (orders and users)
  useEffect(() => {
    if (!isAdmin) {
      setAllOrders([]);
      setAllUsers([]);
      return;
    }

    const unsubOrders = subscribeAllOrders(setAllOrders);
    const unsubUsers = subscribeAllUsers(setAllUsers);

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [isAdmin]);

  // Route according to role after authentication
  useEffect(() => {
    if (currentUser) {
      if (isAdmin) {
        setIsAdminView(true);
        setAdminTab('dashboard');
        setIsCartOpen(false);
      } else {
        setIsAdminView(false);
        setActiveTab('catalog');
      }
    }
  }, [currentUser?.uid, isAdmin]);

  // Route Protection: If non-admin attempts to view admin panel, redirect to catalog
  useEffect(() => {
    if (isAdminView && !isAdmin && !authLoading) {
      setIsAdminView(false);
      setActiveTab('catalog');
      showToast('Akses ditolak: Halaman manajemen hanya dapat diakses oleh Admin.', 'warning');
    }
  }, [isAdminView, isAdmin, authLoading, showToast]);

  // Route Protection: If admin tries to open cart, redirect back to admin dashboard
  useEffect(() => {
    if (isAdmin && isCartOpen) {
      setIsCartOpen(false);
      setIsAdminView(true);
      setAdminTab('dashboard');
    }
  }, [isAdmin, isCartOpen]);

  const handleOrderSuccess = (orderId: string) => {
    setActiveTab('account');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#4A2E18] text-[#E5BA73] flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Coffee className="w-7 h-7" />
          </div>
          <div className="font-black text-stone-900 text-lg">SUDUT KO.FEE</div>
          <p className="text-xs text-stone-500">Memuat sistem aplikasi...</p>
        </div>
      </div>
    );
  }

  // Strict Rule: Unauthenticated users CANNOT access any storefront or admin pages
  // Only Login & Registration modal is presented until authenticated.
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] text-[#2C1810] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Ambient background styling */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-500/10 rounded-full blur-3xl pointer-events-none" />

        <AuthModal isOpen={true} canClose={false} initialMode="login" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#2C1810] font-sans antialiased flex flex-col selection:bg-amber-800 selection:text-white">
      {/* View Branch: Admin Panel (Desktop Sidebar / Laptop Grid) */}
      {isAdmin && isAdminView ? (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Admin Sidebar */}
          <AdminSidebar
            currentTab={adminTab}
            setCurrentTab={setAdminTab}
            onExitAdmin={() => setIsAdminView(false)}
            onOpenOfflineOrderModal={() => {
              setAdminTab('members');
              setIsOpenOfflineModal(true);
            }}
          />

          {/* Admin Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
            {adminTab === 'dashboard' && (
              <AdminDashboard
                orders={allOrders}
                users={allUsers}
                products={products}
                onNavigateToTab={(tab) => setAdminTab(tab)}
              />
            )}
            {adminTab === 'orders' && <AdminOrders orders={allOrders} />}
            {adminTab === 'products' && <AdminProducts products={products} />}
            {adminTab === 'rewards' && <AdminRewards rewards={rewards} />}
            {adminTab === 'members' && (
              <AdminMembers
                users={allUsers}
                products={products}
                orders={allOrders}
                nilaiPerPoin={storeSettings.nilaiPerPoin}
                isOpenOfflineModal={isOpenOfflineModal}
                onCloseOfflineModal={() => setIsOpenOfflineModal(false)}
              />
            )}
            {adminTab === 'reports' && <AdminReports orders={allOrders} />}
            {adminTab === 'settings' && (
              <AdminSettings
                currentSettings={storeSettings}
                onSettingsUpdated={setStoreSettings}
              />
            )}
          </main>
        </div>
      ) : (
        /* View Branch: Customer / User Storefront */
        <>
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdminView={isAdminView}
            setIsAdminView={setIsAdminView}
            onOpenCart={() => {
              if (!isAdmin) {
                setIsCartOpen(true);
              }
            }}
          />

          {/* User Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'catalog' && (
              <ProductCatalog nilaiPerPoin={storeSettings.nilaiPerPoin} />
            )}
            {activeTab === 'rewards' && <RewardsView />}
            {activeTab === 'account' && <AccountView />}
            {activeTab === 'orders' && <AccountView />}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdminView={isAdminView}
            setIsAdminView={setIsAdminView}
            onOpenCart={() => {
              if (!isAdmin) {
                setIsCartOpen(true);
              }
            }}
          />

          {/* Cart Drawer (Disabled entirely for admin) */}
          {!isAdmin && (
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onOrderSuccess={handleOrderSuccess}
              nilaiPerPoin={storeSettings.nilaiPerPoin}
            />
          )}

          {/* Footer for desktop */}
          <footer className="hidden sm:block mt-auto border-t border-amber-900/10 py-8 bg-[#F4EDE2] text-xs text-stone-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-800" />
                <span className="font-extrabold text-stone-900">
                  {storeSettings.namaToko || 'SUDUT KO.FEE'}
                </span>
                <span>• {storeSettings.alamatToko}</span>
              </div>
              <div className="flex items-center gap-4 text-stone-500">
                <span>Kontak: {storeSettings.kontak}</span>
                <span>© {new Date().getFullYear()} SUDUT KO.FEE. Hak Cipta Dilindungi.</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
