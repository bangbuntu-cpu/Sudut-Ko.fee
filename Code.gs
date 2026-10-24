/**
 * =========================================================================
 * SUDUT KO.FEE - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * =========================================================================
 * Spreadsheet Link: https://docs.google.com/spreadsheets/d/14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw/edit?usp=sharing
 * Spreadsheet ID  : 14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw
 *
 * CARA MENGGUNAKAN:
 * 1. Buka spreadsheet Google Anda di atas.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode default di 'Code.gs', lalu salin & tempel SELURUH isi file ini.
 * 4. Klik ikon Disket (Save) atau tekan Ctrl+S.
 * 5. Jalankan fungsi 'setupSheets' satu kali dari dropdown fungsi untuk membuat
 *    semua Sheet (Users, Orders, Products, Rewards, PointHistory, Redemptions, Settings)
 *    beserta header kolom dan data awal secara otomatis!
 * 6. Klik tombol biru 'Deploy' (Terapkan) di kanan atas > 'New deployment' (Penerapan baru).
 * 7. Pilih tipe 'Web app' (Aplikasi web).
 * 8. Konfigurasi:
 *    - Description: Sudut Kofee API Backend
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 9. Klik 'Deploy', berikan izin (Authorize access), lalu salin 'Web app URL'
 *    (berformat: https://script.google.com/macros/s/.../exec).
 * =========================================================================
 */

const SPREADSHEET_ID = '14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw';

// Helper: dapatkan spreadsheet aktif
function getSS() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Inisialisasi otomatis semua Sheet yang dibutuhkan toko:
 * - Users
 * - UserCredentials
 * - Orders
 * - Products
 * - Rewards
 * - PointHistory
 * - Redemptions
 * - Settings
 */
function setupSheets() {
  const ss = getSS();

  const sheetsConfig = [
    {
      name: 'Users',
      headers: ['uid', 'nama', 'email', 'noHp', 'alamat', 'role', 'isMember', 'poin', 'createdAt'],
      initRows: [
        [
          'user_YmFuZ2J1bnR1QGdtYWlsLmNv',
          'Admin SUDUT KO.FEE',
          'bangbuntu@gmail.com',
          '+62 812-3456-7890',
          'Ngoro, Mojokerto',
          'admin',
          false,
          0,
          new Date().toISOString()
        ]
      ]
    },
    {
      name: 'UserCredentials',
      headers: ['uid', 'email', 'salt', 'passwordHash', 'updatedAt'],
      initRows: [
        [
          'user_YmFuZ2J1bnR1QGdtYWlsLmNv',
          'bangbuntu@gmail.com',
          'admin_salt_sudutkofee_v1',
          'b0e062459b790d718496abf22840e39b0ddae96e4d1dc068b8ab7b56a52c9f4a', // Hash of 'Sby12345'
          new Date().toISOString()
        ]
      ]
    },
    {
      name: 'Orders',
      headers: [
        'id',
        'userId',
        'userName',
        'userPhone',
        'userAddress',
        'items',
        'total',
        'status',
        'metodeBayar',
        'sumber',
        'poinDidapat',
        'catatan',
        'createdAt',
        'updatedAt'
      ],
      initRows: []
    },
    {
      name: 'Products',
      headers: ['id', 'nama', 'deskripsi', 'harga', 'stok', 'kategori', 'gambar', 'createdAt', 'updatedAt'],
      initRows: [
        [
          'prod_1',
          'Kopi Susu Gula Aren',
          'Espresso bold berpadu susu segar creamy dan sirup gula aren alami khas Nusantara. Manis pas dan menyegarkan.',
          22000,
          45,
          'Signature',
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_2',
          'Espresso Double Shot',
          'Ekstraksi 100% biji kopi Arabika Specialty dengan crema tebal keemasan, aroma dark chocolate & almond.',
          18000,
          60,
          'Espresso Based',
          'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_3',
          'Caramel Macchiato',
          'Kombinasi harmonis susu segar lembut, sirup vanila murni, espresso shot, dan saus karamel lezat di atasnya.',
          28000,
          30,
          'Signature',
          'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_4',
          'Manual Brew V60 Flores',
          'Single origin Arabika Flores Bajawa diseduh metode pour-over V60. Notes rasa jeruk mandarin, floral, dan aftertaste manis.',
          26000,
          25,
          'Manual Brew',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_5',
          'Cold Brew Signature 16-Jam',
          'Kopi diseduh dingin lambat selama 16 jam. Asam sangat rendah, rasa kaya, halus di tenggorokan, sangat menyegarkan.',
          25000,
          20,
          'Cold Brew',
          'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_6',
          'Vanilla Velvet Latte',
          'Espresso halus berpadu microfoam susu sutra dan sentuhan aroma ekstrak vanilla Bourbon alami.',
          26000,
          35,
          'Espresso Based',
          'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_7',
          'Cappuccino Signature',
          'Rasio klasik seimbang antara espresso pekat, steamed milk, dan busa susu tebal lembut dengan taburan bubuk cokelat.',
          24000,
          40,
          'Espresso Based',
          'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        [
          'prod_8',
          'Matcha Espresso Fusion',
          'Layer estetis dan kaya rasa dari Matcha Uji Jepang asli berselimut susu dingin dan disiram shot espresso mantap.',
          30000,
          28,
          'Signature',
          'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString(),
          new Date().toISOString()
        ]
      ]
    },
    {
      name: 'Rewards',
      headers: ['id', 'nama', 'deskripsi', 'poinDibutuhkan', 'stok', 'gambar', 'createdAt'],
      initRows: [
        [
          'rew_1',
          '1 Cup Kopi Susu Aren Gratis',
          'Voucher penukaran 1 gelas Kopi Susu Gula Aren ukuran reguler di SUDUT KO.FEE.',
          10,
          100,
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString()
        ],
        [
          'rew_2',
          'Tumbler Eksklusif SUDUT KO.FEE (500ml)',
          'Tumbler stainless steel vacuum insulated tahan panas dan dingin hingga 12 jam, ramah lingkungan edisi SUDUT KO.FEE.',
          30,
          15,
          'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString()
        ],
        [
          'rew_3',
          'Biji Kopi Arabika Specialty 250g',
          'Kemasan biji kopi sangrai fresh roast premium siap digiling sesuai selera Anda di rumah.',
          45,
          20,
          'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString()
        ],
        [
          'rew_4',
          'Kaos Barista SUDUT KO.FEE (Cotton 24s)',
          'Kaos merchandise resmi SUDUT KO.FEE berbahan katun nyaman dan sablon premium edisi terbatas.',
          65,
          12,
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
          new Date().toISOString()
        ]
      ]
    },
    {
      name: 'PointHistory',
      headers: ['id', 'userId', 'tipe', 'jumlah', 'keterangan', 'createdAt'],
      initRows: []
    },
    {
      name: 'Redemptions',
      headers: ['id', 'userId', 'userName', 'rewardId', 'namaReward', 'poinDipakai', 'status', 'createdAt'],
      initRows: []
    },
    {
      name: 'Settings',
      headers: [
        'namaToko',
        'kontak',
        'alamatToko',
        'nilaiPerPoin',
        'qrisMerchantName',
        'qrisImageUrl',
        'bankName',
        'bankAccountNumber',
        'bankAccountHolder'
      ],
      initRows: [
        [
          'SUDUT KO.FEE',
          '+62 82141837093',
          'Ngoro, Kec. Ngoro, Kabupaten Mojokerto, Jawa Timur 61385',
          13000,
          'SUDUT KO.FEE',
          'https://drive.google.com/file/d/1kXrn1knajYQbAujuFW5grLAglHtDfAnL/view?usp=sharing',
          'BCA Virtual Account',
          '1360030935750',
          'AYU KUSUMA AIN PUTRI ARDIAN'
        ]
      ]
    }
  ];

  sheetsConfig.forEach(function (cfg) {
    var sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }

    // Set header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4A2E18');
      headerRange.setFontColor('#FAF5EE');
      sheet.setFrozenRows(1);

      // Masukkan baris inisialisasi jika ada
      if (cfg.initRows && cfg.initRows.length > 0) {
        cfg.initRows.forEach(function (row) {
          sheet.appendRow(row);
        });
      }
    }
  });

  return { success: true, message: 'Semua Sheet SUDUT KO.FEE berhasil diinisialisasi!' };
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : 'getAllData';

    if (action === 'init' || action === 'setupSheets') {
      const res = setupSheets();
      return jsonResponse(res);
    }

    if (action === 'getAllData') {
      return jsonResponse({
        success: true,
        users: getSheetDataAsObjects('Users'),
        orders: getSheetDataAsObjects('Orders'),
        products: getSheetDataAsObjects('Products'),
        rewards: getSheetDataAsObjects('Rewards'),
        pointHistory: getSheetDataAsObjects('PointHistory'),
        redemptions: getSheetDataAsObjects('Redemptions'),
        settings: getSettingsObject()
      });
    }

    if (action === 'getProducts') {
      return jsonResponse({ success: true, data: getSheetDataAsObjects('Products') });
    }

    if (action === 'getRewards') {
      return jsonResponse({ success: true, data: getSheetDataAsObjects('Rewards') });
    }

    if (action === 'getOrders') {
      return jsonResponse({ success: true, data: getSheetDataAsObjects('Orders') });
    }

    if (action === 'getUsers') {
      return jsonResponse({ success: true, data: getSheetDataAsObjects('Users') });
    }

    if (action === 'getSettings') {
      return jsonResponse({ success: true, data: getSettingsObject() });
    }

    if (action === 'getUserProfile') {
      const uid = e.parameter.uid;
      const users = getSheetDataAsObjects('Users');
      const user = users.find(function (u) {
        return u.uid === uid;
      });
      return jsonResponse({ success: true, data: user || null });
    }

    return jsonResponse({ success: false, message: 'Aksi tidak dikenal: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    // 1. Inisialisasi Sheet
    if (action === 'setupSheets' || action === 'init') {
      return jsonResponse(setupSheets());
    }

    // 2. Registrasi Akun User Baru
    if (action === 'registerUser') {
      return jsonResponse(handleRegisterUser(payload));
    }

    // 3. Update Profil / Member Baru
    if (action === 'updateMemberStatus' || action === 'updateUser') {
      return jsonResponse(handleUpdateMemberStatus(payload));
    }

    // 4. Tambah Pesanan Baru (Online)
    if (action === 'createOrder') {
      return jsonResponse(handleCreateOrder(payload));
    }

    // 5. Update Status Pesanan (Admin)
    if (action === 'updateOrderStatus') {
      return jsonResponse(handleUpdateOrderStatus(payload));
    }

    // 6. Input Pesanan Kasir Manual (Offline)
    if (action === 'manualOfflineOrder') {
      return jsonResponse(handleManualOfflineOrder(payload));
    }

    // 7. Penukaran Hadiah / Redeem Reward
    if (action === 'redeemReward') {
      return jsonResponse(handleRedeemReward(payload));
    }

    // 8. CRUD Produk
    if (action === 'addProduct') {
      return jsonResponse(handleAddProduct(payload.product));
    }
    if (action === 'updateProduct') {
      return jsonResponse(handleUpdateProduct(payload.id, payload.product));
    }
    if (action === 'deleteProduct') {
      return jsonResponse(handleDeleteProduct(payload.id));
    }

    // 9. CRUD Reward
    if (action === 'addReward') {
      return jsonResponse(handleAddReward(payload.reward));
    }
    if (action === 'updateReward') {
      return jsonResponse(handleUpdateReward(payload.id, payload.reward));
    }
    if (action === 'deleteReward') {
      return jsonResponse(handleDeleteReward(payload.id));
    }

    // 10. Update Pengaturan Toko
    if (action === 'updateSettings') {
      return jsonResponse(handleUpdateSettings(payload.settings));
    }

    return jsonResponse({ success: false, message: 'Aksi POST tidak valid: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// =========================================================================
// HANDLERS
// =========================================================================

function handleRegisterUser(payload) {
  const ss = getSS();
  const usersSheet = ss.getSheetByName('Users');
  const credsSheet = ss.getSheetByName('UserCredentials');

  if (!usersSheet || !credsSheet) setupSheets();

  const email = (payload.email || '').trim().toLowerCase();
  const nama = (payload.nama || '').trim();
  const uid = payload.uid || 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const salt = payload.salt || Math.random().toString(36).substring(2);
  const passwordHash = payload.passwordHash;

  // Cek duplikat email
  const existingUsers = getSheetDataAsObjects('Users');
  const isDuplicate = existingUsers.some(function (u) {
    return (u.email || '').toLowerCase() === email;
  });

  if (isDuplicate) {
    return { success: false, error: 'Email sudah terdaftar. Silakan masuk menggunakan akun Anda.' };
  }

  const createdAt = new Date().toISOString();

  // Tambah ke Users sheet (role selalu 'user' untuk pendaftaran publik)
  usersSheet.appendRow([uid, nama, email, '', '', 'user', false, 0, createdAt]);

  // Simpan kredensial terenkripsi ke UserCredentials sheet
  credsSheet.appendRow([uid, email, salt, passwordHash, createdAt]);

  return {
    success: true,
    user: {
      uid: uid,
      nama: nama,
      email: email,
      role: 'user',
      isMember: false,
      poin: 0,
      createdAt: createdAt
    }
  };
}

function handleUpdateMemberStatus(payload) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, error: 'Sheet Users tidak ditemukan' };

  const uid = payload.uid;
  const nama = payload.nama;
  const noHp = payload.noHp;
  const alamat = payload.alamat;

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, error: 'User tidak ditemukan' };

  const headers = data[0];
  const uidIdx = headers.indexOf('uid');
  const namaIdx = headers.indexOf('nama');
  const noHpIdx = headers.indexOf('noHp');
  const alamatIdx = headers.indexOf('alamat');
  const isMemberIdx = headers.indexOf('isMember');

  for (var i = 1; i < data.length; i++) {
    if (data[i][uidIdx] === uid) {
      if (nama && namaIdx !== -1) sheet.getRange(i + 1, namaIdx + 1).setValue(nama);
      if (noHp && noHpIdx !== -1) sheet.getRange(i + 1, noHpIdx + 1).setValue(noHp);
      if (alamat && alamatIdx !== -1) sheet.getRange(i + 1, alamatIdx + 1).setValue(alamat);
      if (isMemberIdx !== -1) sheet.getRange(i + 1, isMemberIdx + 1).setValue(true);
      return { success: true };
    }
  }

  return { success: false, error: 'User dengan UID ' + uid + ' tidak ditemukan' };
}

function handleCreateOrder(payload) {
  const ss = getSS();
  const ordersSheet = ss.getSheetByName('Orders');
  const productsSheet = ss.getSheetByName('Products');
  if (!ordersSheet) setupSheets();

  const id = payload.id || 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const itemsJson = typeof payload.items === 'string' ? payload.items : JSON.stringify(payload.items || []);

  ordersSheet.appendRow([
    id,
    payload.userId || '',
    payload.userName || '',
    payload.userPhone || '',
    payload.userAddress || '',
    itemsJson,
    payload.total || 0,
    payload.status || 'Menunggu',
    payload.metodeBayar || 'qris',
    payload.sumber || 'online',
    payload.poinDidapat || 0,
    payload.catatan || '',
    now,
    now
  ]);

  // Potong stok produk otomatis
  try {
    const items = typeof payload.items === 'string' ? JSON.parse(payload.items) : payload.items || [];
    if (productsSheet && Array.isArray(items)) {
      const prodData = productsSheet.getDataRange().getValues();
      const pHeaders = prodData[0];
      const pIdIdx = pHeaders.indexOf('id');
      const pStokIdx = pHeaders.indexOf('stok');

      items.forEach(function (item) {
        for (var p = 1; p < prodData.length; p++) {
          if (prodData[p][pIdIdx] === item.productId) {
            var currentStok = Number(prodData[p][pStokIdx]) || 0;
            var newStok = Math.max(0, currentStok - (Number(item.jumlah) || 1));
            productsSheet.getRange(p + 1, pStokIdx + 1).setValue(newStok);
            break;
          }
        }
      });
    }
  } catch (err) {
    // Abaikan kegagalan potong stok non-fatal
  }

  return { success: true, orderId: id };
}

function handleUpdateOrderStatus(payload) {
  const ss = getSS();
  const ordersSheet = ss.getSheetByName('Orders');
  const usersSheet = ss.getSheetByName('Users');
  const historySheet = ss.getSheetByName('PointHistory');

  if (!ordersSheet) return { success: false, error: 'Sheet Orders tidak ditemukan' };

  const orderId = payload.orderId;
  const newStatus = payload.newStatus;
  const now = new Date().toISOString();

  const oData = ordersSheet.getDataRange().getValues();
  const oHeaders = oData[0];
  const idIdx = oHeaders.indexOf('id');
  const statusIdx = oHeaders.indexOf('status');
  const updatedIdx = oHeaders.indexOf('updatedAt');
  const userIdIdx = oHeaders.indexOf('userId');
  const poinIdx = oHeaders.indexOf('poinDidapat');
  const sumberIdx = oHeaders.indexOf('sumber');

  for (var i = 1; i < oData.length; i++) {
    if (oData[i][idIdx] === orderId) {
      const oldStatus = oData[i][statusIdx];
      const userId = oData[i][userIdIdx];
      const poinDidapat = Number(oData[i][poinIdx]) || 0;
      const sumber = oData[i][sumberIdx] || 'online';

      ordersSheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (updatedIdx !== -1) ordersSheet.getRange(i + 1, updatedIdx + 1).setValue(now);

      // Jika berubah ke 'Selesai' dan konsumen adalah Member, tambahkan poin!
      if (newStatus === 'Selesai' && oldStatus !== 'Selesai' && poinDidapat > 0 && userId && usersSheet) {
        addPointsToMember(usersSheet, historySheet, userId, poinDidapat, 'Poin pesanan #' + orderId.slice(0, 6) + ' (' + sumber + ')');
      }

      return { success: true };
    }
  }

  return { success: false, error: 'Pesanan ' + orderId + ' tidak ditemukan' };
}

function handleManualOfflineOrder(payload) {
  const ss = getSS();
  const ordersSheet = ss.getSheetByName('Orders');
  const usersSheet = ss.getSheetByName('Users');
  const historySheet = ss.getSheetByName('PointHistory');

  const id = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const itemsJson = typeof payload.items === 'string' ? payload.items : JSON.stringify(payload.items || []);

  ordersSheet.appendRow([
    id,
    payload.memberId || '',
    payload.memberName || '',
    payload.memberPhone || '',
    '',
    itemsJson,
    payload.total || 0,
    payload.status || 'Selesai',
    payload.metodeBayar || 'qris',
    'offline',
    payload.poinDidapat || 0,
    payload.catatan || 'Transaksi kasir offline',
    now,
    now
  ]);

  if (payload.status === 'Selesai' && payload.poinDidapat > 0 && payload.memberId && usersSheet) {
    addPointsToMember(usersSheet, historySheet, payload.memberId, payload.poinDidapat, 'Poin belanja offline #' + id.slice(0, 6));
  }

  return { success: true, orderId: id };
}

function handleRedeemReward(payload) {
  const ss = getSS();
  const usersSheet = ss.getSheetByName('Users');
  const rewardsSheet = ss.getSheetByName('Rewards');
  const historySheet = ss.getSheetByName('PointHistory');
  const redemptionsSheet = ss.getSheetByName('Redemptions');

  const userId = payload.userId;
  const rewardId = payload.rewardId;
  const poinDipakai = Number(payload.poinDipakai) || 0;

  // 1. Kurangi poin user
  const uData = usersSheet.getDataRange().getValues();
  const uHeaders = uData[0];
  const uIdIdx = uHeaders.indexOf('uid');
  const uPoinIdx = uHeaders.indexOf('poin');
  const uNameIdx = uHeaders.indexOf('nama');
  let userName = payload.userName || '';

  var userRow = -1;
  for (var i = 1; i < uData.length; i++) {
    if (uData[i][uIdIdx] === userId) {
      userRow = i + 1;
      userName = uData[i][uNameIdx] || userName;
      var curPoin = Number(uData[i][uPoinIdx]) || 0;
      if (curPoin < poinDipakai) {
        return { success: false, error: 'Poin tidak mencukupi untuk menukar hadiah ini.' };
      }
      usersSheet.getRange(userRow, uPoinIdx + 1).setValue(curPoin - poinDipakai);
      break;
    }
  }

  // 2. Kurangi stok reward
  const rData = rewardsSheet.getDataRange().getValues();
  const rHeaders = rData[0];
  const rIdIdx = rHeaders.indexOf('id');
  const rStokIdx = rHeaders.indexOf('stok');
  const rNameIdx = rHeaders.indexOf('nama');
  let rewardName = payload.namaReward || '';

  for (var r = 1; r < rData.length; r++) {
    if (rData[r][rIdIdx] === rewardId) {
      rewardName = rData[r][rNameIdx] || rewardName;
      var curStok = Number(rData[r][rStokIdx]) || 0;
      rewardsSheet.getRange(r + 1, rStokIdx + 1).setValue(Math.max(0, curStok - 1));
      break;
    }
  }

  const now = new Date().toISOString();

  // 3. Catat di PointHistory
  if (historySheet) {
    historySheet.appendRow([
      'pth_' + Date.now().toString(36),
      userId,
      'keluar',
      poinDipakai,
      'Penukaran reward: ' + rewardName,
      now
    ]);
  }

  // 4. Catat di Redemptions
  if (redemptionsSheet) {
    redemptionsSheet.appendRow([
      'rdm_' + Date.now().toString(36),
      userId,
      userName,
      rewardId,
      rewardName,
      poinDipakai,
      'Selesai',
      now
    ]);
  }

  return { success: true };
}

function handleAddProduct(product) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Products');
  const id = 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  sheet.appendRow([
    id,
    product.nama || '',
    product.deskripsi || '',
    Number(product.harga) || 0,
    Number(product.stok) || 0,
    product.kategori || 'Coffee',
    product.gambar || '',
    now,
    now
  ]);

  return { success: true, id: id };
}

function handleUpdateProduct(id, product) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === id) {
      Object.keys(product).forEach(function (key) {
        var col = headers.indexOf(key);
        if (col !== -1) {
          sheet.getRange(i + 1, col + 1).setValue(product[key]);
        }
      });
      var updatedIdx = headers.indexOf('updatedAt');
      if (updatedIdx !== -1) sheet.getRange(i + 1, updatedIdx + 1).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  return { success: false, error: 'Produk tidak ditemukan' };
}

function handleDeleteProduct(id) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Produk tidak ditemukan' };
}

function handleAddReward(reward) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Rewards');
  const id = 'rew_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  sheet.appendRow([
    id,
    reward.nama || '',
    reward.deskripsi || '',
    Number(reward.poinDibutuhkan) || 10,
    Number(reward.stok) || 0,
    reward.gambar || '',
    now
  ]);

  return { success: true, id: id };
}

function handleUpdateReward(id, reward) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Rewards');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === id) {
      Object.keys(reward).forEach(function (key) {
        var col = headers.indexOf(key);
        if (col !== -1) {
          sheet.getRange(i + 1, col + 1).setValue(reward[key]);
        }
      });
      return { success: true };
    }
  }
  return { success: false, error: 'Reward tidak ditemukan' };
}

function handleDeleteReward(id) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Rewards');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Reward tidak ditemukan' };
}

function handleUpdateSettings(newSettings) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) setupSheets();

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  Object.keys(newSettings).forEach(function (key) {
    var col = headers.indexOf(key);
    if (col !== -1) {
      sheet.getRange(2, col + 1).setValue(newSettings[key]);
    }
  });

  return { success: true };
}

// Helper untuk tambah poin ke member dan catat log
function addPointsToMember(usersSheet, historySheet, userId, points, keterangan) {
  const uData = usersSheet.getDataRange().getValues();
  const uHeaders = uData[0];
  const idIdx = uHeaders.indexOf('uid');
  const poinIdx = uHeaders.indexOf('poin');
  const isMemberIdx = uHeaders.indexOf('isMember');

  for (var i = 1; i < uData.length; i++) {
    if (uData[i][idIdx] === userId) {
      var isMember = uData[i][isMemberIdx];
      if (isMember) {
        var currentPoin = Number(uData[i][poinIdx]) || 0;
        usersSheet.getRange(i + 1, poinIdx + 1).setValue(currentPoin + points);

        if (historySheet) {
          historySheet.appendRow([
            'pth_' + Date.now().toString(36),
            userId,
            'masuk',
            points,
            keterangan,
            new Date().toISOString()
          ]);
        }
      }
      break;
    }
  }
}

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

function getSheetDataAsObjects(sheetName) {
  const ss = getSS();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const results = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      var val = row[c];
      // Parsing JSON fields jika diperlukan (seperti items pada Orders)
      if (key === 'items' && typeof val === 'string' && val.trim().startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {}
      }
      obj[key] = val;
    }
    results.push(obj);
  }

  return results;
}

function getSettingsObject() {
  const ss = getSS();
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;

  const headers = values[0];
  const row = values[1];
  const settings = {};

  for (var i = 0; i < headers.length; i++) {
    settings[headers[i]] = row[i];
  }

  return settings;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
