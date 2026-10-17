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
  cleanupAllDemoData
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

  // Initial Auto-seed and purge demo data on first boot
  useEffect(() => {
    cleanupAllDemoData().catch(console.error);
    seedDatabaseIfEmpty().catch(console.error);
  }, []);

  // Subscribe to core data
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

  // Route Protection: If non-admin attempts to view admin panel, redirect to catalog
  useEffect(() => {
    if (isAdminView && !isAdmin && !authLoading) {
      setIsAdminView(false);
      setActiveTab('catalog');
      showToast('Akses ditolak: Halaman manajemen hanya dapat diakses oleh Admin.', 'warning');
    }
  }, [isAdminView, isAdmin, authLoading, showToast]);

  const handleOrderSuccess = (orderId: string) => {
    setActiveTab('account');
  };

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
            onOpenCart={() => setIsCartOpen(true)}
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
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onOrderSuccess={handleOrderSuccess}
            nilaiPerPoin={storeSettings.nilaiPerPoin}
          />

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
