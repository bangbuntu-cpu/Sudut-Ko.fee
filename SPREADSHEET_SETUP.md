# Panduan Integrasi Google Spreadsheet & Apps Script (SUDUT KO.FEE)

Spreadsheet Target:
👉 **[Buka Spreadsheet Google Anda](https://docs.google.com/spreadsheets/d/14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw/edit?usp=sharing)**
Spreadsheet ID: `14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw`

---

## Struktur Sheet yang Digunakan

Aplikasi SUDUT KO.FEE menggunakan 8 Sheet berikut di dalam Google Spreadsheet Anda:

| Nama Sheet | Keterangan & Isi Kolom |
|---|---|
| **Users** | Data seluruh member dan user: `uid`, `nama`, `email`, `noHp`, `alamat`, `role`, `isMember`, `poin`, `createdAt` |
| **UserCredentials** | Kredensial password terenkripsi aman (SHA-256 + Salt): `uid`, `email`, `salt`, `passwordHash`, `updatedAt` |
| **Orders** | Data transaksi pemesanan (online & kasir offline): `id`, `userId`, `userName`, `userPhone`, `userAddress`, `items`, `total`, `status`, `metodeBayar`, `sumber`, `poinDidapat`, `catatan`, `createdAt`, `updatedAt` |
| **Products** | Katalog menu kopi: `id`, `nama`, `deskripsi`, `harga`, `stok`, `kategori`, `gambar`, `createdAt`, `updatedAt` |
| **Rewards** | Katalog penukaran hadiah poin: `id`, `nama`, `deskripsi`, `poinDibutuhkan`, `stok`, `gambar`, `createdAt` |
| **PointHistory** | Riwayat transaksi poin loyalty: `id`, `userId`, `tipe`, `jumlah`, `keterangan`, `createdAt` |
| **Redemptions** | Riwayat penukaran hadiah member: `id`, `userId`, `userName`, `rewardId`, `namaReward`, `poinDipakai`, `status`, `createdAt` |
| **Settings** | Pengaturan nama toko, alamat, kontak, nilai per poin, QRIS & Transfer Bank |

---

## Langkah Penerapan (Deploy) Google Apps Script (Code.gs)

File `Code.gs` sudah disiapkan secara lengkap di root proyek aplikasi. Untuk menghubungkan spreadsheet secara langsung:

1. **Buka Spreadsheet**:
   Kunjungi link: https://docs.google.com/spreadsheets/d/14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw/edit?usp=sharing

2. **Buka Apps Script**:
   Pada menu Google Spreadsheet di bagian atas, klik **Extensions (Ekstensi)** > **Apps Script**.

3. **Salin Kode `Code.gs`**:
   Hapus semua teks yang ada di jendela editor `Code.gs`, lalu salin seluruh isi file `Code.gs` dari proyek ini dan tempelkan ke editor Apps Script.

4. **Simpan Proyek**:
   Klik ikon disket **Save project** (Ctrl + S).

5. **Buat Semua Sheet & Header Otomatis (Satu Kali Klik)**:
   - Pada dropdown pilihan fungsi di samping tombol 'Debug', pilih fungsi **`setupSheets`**.
   - Klik tombol **Run (Jalankan)**.
   - Google akan meminta izin (*Authorization Required*), klik *Review Permissions*, pilih akun Google Anda, klik *Advanced* > *Go to ... (unsafe)*, lalu klik *Allow*.
   - Selesai! Semua sheet beserta baris header dan data default toko akan otomatis terbuat di Spreadsheet Anda.

6. **Deploy sebagai Web App**:
   - Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
   - Klik ikon gerigi (Select type) > pilih **Web app (Aplikasi web)**.
   - Konfigurasi:
     * **Description**: Sudut Kofee API
     * **Execute as**: **Me** (email akun Anda)
     * **Who has access**: **Anyone** (Siapa saja)
   - Klik **Deploy**.
   - Salin **Web app URL** yang muncul (contoh format: `https://script.google.com/macros/s/AKfycb.../exec`).

7. **Selesai**:
   Aplikasi otomatis menyimpan dan mengarahkan data ke Spreadsheet target!
