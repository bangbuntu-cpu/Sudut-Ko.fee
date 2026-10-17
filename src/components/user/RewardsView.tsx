import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Gift,
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
  Lock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Reward, Redemption } from '../../types';
import {
  subscribeRewards,
  redeemReward,
  subscribeUserRedemptions
} from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { ConfirmModal } from '../common/ConfirmModal';
import { AuthModal } from '../auth/AuthModal';

export const RewardsView: React.FC = () => {
  const { currentUser, userProfile, isMember } = useAuth();
  const { showToast } = useToast();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  // Confirmation modal state
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubRewards = subscribeRewards((list) => {
      setRewards(list);
      setLoadingRewards(false);
    });
    return () => unsubRewards();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setRedemptions([]);
      return;
    }
    setLoadingRedemptions(true);
    const unsubRedemptions = subscribeUserRedemptions(currentUser.uid, (list) => {
      setRedemptions(list);
      setLoadingRedemptions(false);
    });
    return () => unsubRedemptions();
  }, [currentUser]);

  const userPoints = userProfile?.poin || 0;

  const handleOpenConfirm = (reward: Reward) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!isMember) {
      showToast('Khusus Member SUDUT KO.FEE. Lakukan transaksi pertama untuk jadi Member!', 'warning');
      return;
    }
    if (userPoints < reward.poinDibutuhkan) {
      showToast(`Poin tidak cukup. Anda membutuhkan ${reward.poinDibutuhkan} poin.`, 'warning');
      return;
    }
    if (reward.stok <= 0) {
      showToast('Stok reward ini sedang habis.', 'warning');
      return;
    }
    setSelectedRewardToRedeem(reward);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedRewardToRedeem || !currentUser) return;
    setIsRedeeming(true);

    try {
      await redeemReward(
        currentUser.uid,
        userProfile?.nama || 'Member SUDUT KO.FEE',
        selectedRewardToRedeem
      );

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 }
        });
      } catch {
        // ignore
      }

      showToast(
        `Selamat! Penukaran reward "${selectedRewardToRedeem.nama}" berhasil. Tunjukkan riwayat ke kasir!`,
        'success',
        'Penukaran Berhasil'
      );
      setSelectedRewardToRedeem(null);
      setActiveTab('history');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menukarkan poin', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="pb-24 sm:pb-16 max-w-6xl mx-auto">
      {/* Point Balance Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#382110] via-[#4A2E18] to-[#251208] text-white p-6 sm:p-8 mb-8 shadow-xl border border-amber-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Program Loyalitas SUDUT KO.FEE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Tukar Poin &amp; Hadiah</h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-lg">
              Kumpulkan poin setiap membeli kopi favorit Anda. Tukarkan langsung dengan cangkir kopi gratis,
              tumbler stainless eksklusif, atau biji kopi spesial.
            </p>
          </div>

          {/* Points Pill Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center min-w-[200px] shrink-0 w-full sm:w-auto shadow-inner">
            <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold block mb-1">
              Saldo Poin Anda
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight flex items-center justify-center gap-2">
              <Award className="w-7 h-7 text-amber-400 inline" />
              <span>{userPoints}</span>
            </div>
            <span className="text-[11px] text-stone-300 mt-1 block">
              {isMember ? 'Status: Member Terverifikasi' : 'Status: Belum Terdaftar Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-stone-200/80 p-1.5 rounded-2xl max-w-sm mb-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-[#4A2E18] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Gift className="w-4 h-4" />
          Katalog Hadiah
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#4A2E18] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat Penukaran ({redemptions.length})
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <>
          {loadingRewards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm animate-pulse h-80"
                />
              ))}
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <Gift className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Hadiah Belum Tersedia</h3>
              <p className="text-xs text-stone-500 mt-1">Admin sedang menyiapkan hadiah menarik untuk Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {rewards.map((reward) => {
                const canRedeem = isMember && userPoints >= reward.poinDibutuhkan && reward.stok > 0;
                const pointsShort = reward.poinDibutuhkan - userPoints;

                return (
                  <div
                    key={reward.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={reward.gambar}
                          alt={reward.nama}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-600 text-white shadow-md flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> {reward.poinDibutuhkan} Poin
                          </span>
                        </div>
                        {reward.stok <= 0 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-black uppercase">
                            Stok Habis
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                          {reward.nama}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                          {reward.deskripsi}
                        </p>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-2">
                          <span>Stok Tersisa:</span>
                          <span className="font-bold text-stone-800">{reward.stok} unit</span>
                        </div>
                      </div>
                    </div>

                    {/* Redeem Button */}
                    <div className="p-4 pt-0">
                      {canRedeem ? (
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(reward)}
                          className="w-full py-2.5 rounded-xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] text-xs font-bold shadow-md shadow-amber-950/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Gift className="w-4 h-4 text-amber-300" />
                          <span>Tukar {reward.poinDibutuhkan} Poin</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          {reward.stok <= 0 ? (
                            'Stok Habis'
                          ) : !currentUser ? (
                            'Masuk untuk Menukar'
                          ) : !isMember ? (
                            'Khusus Member'
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Kurang {pointsShort} Poin
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Redemption History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900">Riwayat Penukaran Hadiah</h2>
          </div>

          {loadingRedemptions ? (
            <div className="py-12 text-center text-xs text-stone-400">Memuat riwayat...</div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500">Anda belum pernah menukarkan poin.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {redemptions.map((red) => (
                <div key={red.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">{red.namaReward}</h4>
                    <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(red.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-1">
                      -{red.poinDipakai} Poin
                    </span>
                    <div className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{red.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedRewardToRedeem && (
        <ConfirmModal
          isOpen={Boolean(selectedRewardToRedeem)}
          onClose={() => setSelectedRewardToRedeem(null)}
          onConfirm={handleConfirmRedeem}
          title="Konfirmasi Penukaran Poin"
          message={`Apakah Anda yakin ingin menukarkan ${selectedRewardToRedeem.poinDibutuhkan} poin dengan "${selectedRewardToRedeem.nama}"? Poin Anda akan otomatis berkurang.`}
          confirmLabel={`Tukar (${selectedRewardToRedeem.poinDibutuhkan} Poin)`}
          isLoading={isRedeeming}
        />
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
