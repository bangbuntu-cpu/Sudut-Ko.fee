import React, { useState, useEffect } from 'react';
import {
  Settings,
  Award,
  Store,
  Phone,
  MapPin,
  Save,
  Sparkles,
  Calculator,
  QrCode,
  CreditCard
} from 'lucide-react';
import { StoreSettings, AdditionalOption } from '../../types';
import {
  getStoreSettings,
  updateStoreSettings,
  updateAdditionalPrices,
  subscribeAdditionals,
  getStoredAdditionals
} from '../../services/dbService';
import { formatRupiah, calculatePoints } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

interface AdminSettingsProps {
  currentSettings: StoreSettings;
  onSettingsUpdated: (newSettings: StoreSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentSettings,
  onSettingsUpdated
}) => {
  const { showToast } = useToast();

  const [nilaiPerPoin, setNilaiPerPoin] = useState<number>(currentSettings.nilaiPerPoin || 13000);
  const [namaToko, setNamaToko] = useState(currentSettings.namaToko || 'SUDUT KO.FEE');
  const [kontak, setKontak] = useState(currentSettings.kontak || '+62 812-3456-7890');
  const [alamatToko, setAlamatToko] = useState(
    currentSettings.alamatToko || 'Jl. Senopati No. 45, Jakarta Selatan'
  );
  const [qrisMerchantName, setQrisMerchantName] = useState(currentSettings.qrisMerchantName || 'SUDUT KO.FEE');
  const [qrisImageUrl, setQrisImageUrl] = useState(currentSettings.qrisImageUrl || '');
  const [bankName, setBankName] = useState(currentSettings.bankName || 'BCA Virtual Account');
  const [bankAccountNumber, setBankAccountNumber] = useState(currentSettings.bankAccountNumber || '8000812990012345');
  const [bankAccountHolder, setBankAccountHolder] = useState(currentSettings.bankAccountHolder || 'PT SUDUT KO.FEE NUSANTARA');

  // Additional Item Prices
  const [additionalsList, setAdditionalsList] = useState<AdditionalOption[]>(getStoredAdditionals());
  const [hargaEspresso, setHargaEspresso] = useState<number>(4000);
  const [hargaSeasalt, setHargaSeasalt] = useState<number>(5000);
  const [hargaOatmilk, setHargaOatmilk] = useState<number>(6000);
  const [hargaAlmond, setHargaAlmond] = useState<number>(6000);
  const [hargaUpsize, setHargaUpsize] = useState<number>(4000);

  const [isSaving, setIsSaving] = useState(false);

  // Simulation calculator
  const [simulasiBelanja, setSimulasiBelanja] = useState<number>(50000);

  useEffect(() => {
    const unsub = subscribeAdditionals((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setAdditionalsList(list);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const esp = additionalsList.find((a) => a.id === 'addon_espresso')?.harga;
    const sea = additionalsList.find((a) => a.id === 'addon_seasalt')?.harga;
    const oat = additionalsList.find((a) => a.id === 'addon_oatmilk')?.harga;
    const alm = additionalsList.find((a) => a.id === 'addon_almond')?.harga;
    const upz = additionalsList.find((a) => a.id === 'addon_upsize')?.harga;

    if (esp !== undefined) setHargaEspresso(esp);
    if (sea !== undefined) setHargaSeasalt(sea);
    if (oat !== undefined) setHargaOatmilk(oat);
    if (alm !== undefined) setHargaAlmond(alm);
    if (upz !== undefined) setHargaUpsize(upz);
  }, [additionalsList]);

  useEffect(() => {
    setNilaiPerPoin(Number(currentSettings.nilaiPerPoin) || 13000);
    setNamaToko(String(currentSettings.namaToko || 'SUDUT KO.FEE'));
    setKontak(String(currentSettings.kontak || '+62 812-3456-7890'));
    setAlamatToko(String(currentSettings.alamatToko || ''));
    setQrisMerchantName(String(currentSettings.qrisMerchantName || 'SUDUT KO.FEE'));
    setQrisImageUrl(String(currentSettings.qrisImageUrl || ''));
    setBankName(String(currentSettings.bankName || 'BCA Virtual Account'));
    setBankAccountNumber(String(currentSettings.bankAccountNumber || ''));
    setBankAccountHolder(String(currentSettings.bankAccountHolder || ''));
  }, [currentSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nilaiPerPoin <= 0) {
      showToast('Nilai per poin harus lebih besar dari 0', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const updated: StoreSettings = {
        nilaiPerPoin: Number(nilaiPerPoin),
        namaToko: String(namaToko || '').trim(),
        kontak: String(kontak || '').trim(),
        alamatToko: String(alamatToko || '').trim(),
        qrisMerchantName: String(qrisMerchantName || '').trim(),
        qrisImageUrl: String(qrisImageUrl || '').trim(),
        bankName: String(bankName || '').trim(),
        bankAccountNumber: String(bankAccountNumber || '').trim(),
        bankAccountHolder: String(bankAccountHolder || '').trim(),
        hargaEspresso: Number(hargaEspresso) || 4000,
        hargaSeasalt: Number(hargaSeasalt) || 5000,
        hargaOatmilk: Number(hargaOatmilk) || 6000,
        hargaAlmond: Number(hargaAlmond) || 6000,
        hargaUpsize: Number(hargaUpsize) || 4000
      };
      const updatedAdditionals: AdditionalOption[] = [
        {
          id: 'addon_espresso',
          nama: 'Espresso',
          harga: Number(hargaEspresso) || 4000,
          keterangan: 'Ekstra 1 shot Espresso bold Arabika',
          badge: 'Extra Shot'
        },
        {
          id: 'addon_seasalt',
          nama: 'Seasalt cream',
          harga: Number(hargaSeasalt) || 5000,
          keterangan: 'Topping krim gurih lembut khas Sudut Ko.fee',
          badge: 'Topping'
        },
        {
          id: 'addon_oatmilk',
          nama: 'Oatmilk',
          harga: Number(hargaOatmilk) || 6000,
          keterangan: 'Ganti atau tambah susu gandum oat creamy ramah nabati',
          badge: 'Plant Based'
        },
        {
          id: 'addon_almond',
          nama: 'Almond Milk',
          harga: Number(hargaAlmond) || 6000,
          keterangan: 'Ganti atau tambah susu almond dengan aroma nutty',
          badge: 'Plant Based'
        },
        {
          id: 'addon_upsize',
          nama: 'Upsize',
          harga: Number(hargaUpsize) || 4000,
          keterangan: 'Upgrade cup ke ukuran Large untuk porsi lebih puas',
          badge: 'Large Cup'
        }
      ];

      await updateStoreSettings(updated);
      await updateAdditionalPrices(updatedAdditionals);
      onSettingsUpdated(updated);
      showToast('Pengaturan toko & harga item additional berhasil disimpan ke Spreadsheet!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setIsSaving(false);
    }
  };



  const simulasiPoin = calculatePoints(simulasiBelanja, nilaiPerPoin);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Pengaturan Aturan Poin &amp; Profil Toko
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Atur rasio perolehan poin belanja member, identitas kafe, dan pemeliharaan database
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Point Calculation Rule Box */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                Aturan Nilai Poin Loyalitas Member
              </h2>
              <p className="text-xs text-stone-500">
                Kelipatan total belanja yang menghasilkan 1 poin bagi member saat pesanan selesai
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Kelipatan Belanja untuk 1 Poin (Rupiah)
            </label>
            <div className="flex items-center gap-3 max-w-xs">
              <span className="text-xs font-bold text-stone-500">Rp</span>
              <input
                type="number"
                min={1000}
                step={1000}
                required
                value={nilaiPerPoin}
                onChange={(e) => setNilaiPerPoin(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              <span className="text-xs font-bold text-stone-600 shrink-0">= 1 Poin</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5">
              Setiap kelipatan {formatRupiah(nilaiPerPoin || 10000)} belanja, pembeli/member otomatis mendapatkan 1 poin.
            </p>
          </div>

          {/* Live Simulator Widget */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">Simulasi Perhitungan Poin</span>
                <span className="text-[11px] text-amber-900/80">
                  Uji coba nilai perolehan poin dari nominal belanja tertentu
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="number"
                min={0}
                step={5000}
                value={simulasiBelanja}
                onChange={(e) => setSimulasiBelanja(Number(e.target.value))}
                className="w-32 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                placeholder="50000"
              />
              <span className="text-xs font-black text-amber-950 bg-amber-200/90 px-3 py-1.5 rounded-xl shrink-0">
                =&gt; +{simulasiPoin} Poin
              </span>
            </div>
          </div>
        </div>

        {/* Store Profile Box */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Identitas Kafe &amp; Kontak</h2>
              <p className="text-xs text-stone-500">Informasi yang muncul di nota pesanan dan kartu member</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nama Toko / Kafe
              </label>
              <input
                type="text"
                required
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nomor WhatsApp Kasir
              </label>
              <input
                type="text"
                required
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Alamat Kafe Fisik
              </label>
              <textarea
                rows={2}
                required
                value={alamatToko}
                onChange={(e) => setAlamatToko(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods Settings (QRIS & Transfer Bank) */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Pengaturan Pembayaran (QRIS &amp; Transfer Bank)</h2>
              <p className="text-xs text-stone-500">Atur nomor rekening, nama pemilik bank, dan QRIS merchant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nama Merchant / Toko QRIS
              </label>
              <input
                type="text"
                value={qrisMerchantName}
                onChange={(e) => setQrisMerchantName(e.target.value)}
                placeholder="SUDUT KO.FEE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                URL Gambar QRIS (Opsional)
              </label>
              <input
                type="text"
                value={qrisImageUrl}
                onChange={(e) => setQrisImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nama Bank / Layanan
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="BCA Virtual Account"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nomor Rekening / VA
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="8000812990012345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Atas Nama Pemilik Rekening
              </label>
              <input
                type="text"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                placeholder="PT SUDUT KO.FEE NUSANTARA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Additional Item Prices Settings Box */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                Pengaturan Harga Item Additional &amp; Topping
              </h2>
              <p className="text-xs text-stone-500">
                Atur nominal harga tambahan per porsi untuk tiap item additional yang dapat dipilih pelanggan di keranjang
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
              <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                ☕ Extra Shot Espresso (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={hargaEspresso}
                onChange={(e) => setHargaEspresso(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-black text-amber-950 text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Harga default: Rp 4.000</span>
            </div>

            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
              <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                🌊 Seasalt Cream (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={hargaSeasalt}
                onChange={(e) => setHargaSeasalt(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-black text-amber-950 text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Harga default: Rp 5.000</span>
            </div>

            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
              <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                🌾 Oatmilk (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={hargaOatmilk}
                onChange={(e) => setHargaOatmilk(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-black text-amber-950 text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Harga default: Rp 6.000</span>
            </div>

            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
              <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                🌰 Almond Milk (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={hargaAlmond}
                onChange={(e) => setHargaAlmond(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-black text-amber-950 text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Harga default: Rp 6.000</span>
            </div>

            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
              <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                🥤 Upsize Large Cup (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={hargaUpsize}
                onChange={(e) => setHargaUpsize(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-black text-amber-950 text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Harga default: Rp 4.000</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-[#4A2E18] hover:bg-[#382110] text-[#FAF5EE] font-extrabold text-sm shadow-xl shadow-amber-950/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Perubahan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};
