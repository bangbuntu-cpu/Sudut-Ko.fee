/**
 * =========================================================================
 * SUDUT KO.FEE - GOOGLE APPS SCRIPT DATABASE BACKEND (Code.gs)
 * =========================================================================
 * Spreadsheet Link: https://docs.google.com/spreadsheets/d/14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw/edit?usp=sharing
 * Spreadsheet ID  : 14QSHPhQKGRPBKnzO-9pWJV8-6JiIBaJ2BSG4oXrWmZw
 * Web App URL     : https://script.google.com/macros/s/AKfycbw7sDnzIh15Efg2OSeW123YqFJBqa_144QtEtR235YSUi5KKpPJQaOkA_jV-SPVorjB/exec
 *
 * FITUR DATABASE:
 * - Users           : Data Profil Pelanggan & Member (Poin, No HP, Alamat, Role)
 * - UserCredentials : Data Kredensial Terenkripsi (Hash SHA-256 & Salt)
 * - Orders          : Pesanan Masuk (Online App & Kasir Offline)
 * - Products        : Katalog Menu Minuman/Kopi (Harga, Stok, Kategori, Foto)
 * - Rewards         : Daftar Hadiah Penukaran Poin Loyalitas
 * - PointHistory    : Riwayat Poin Masuk & Keluar Member
 * - Redemptions     : Riwayat Klaim Penukaran Hadiah
 * - Settings        : Aturan Poin, Info Toko, QRIS, & Rekening Bank
 *
 * SEMUA PENAMBAHAN, PERUBAHAN & PENGHAPUSAN DI WEB TERHUBUNG OTOMATIS!
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

// Helper sanitasi teks nomor telepon/nomor rekening agar tidak error formula di Google Sheet (+62...)
function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  var str = String(val).trim();
  if (str.startsWith('+') || str.startsWith('0') || str.startsWith('=')) {
    return "'" + str;
  }
  return val;
}

/**
 * Inisialisasi otomatis semua Sheet yang dibutuhkan toko
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
          "'+62 812-3456-7890",
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
          'b0e062459b790d718496abf22840e39b0ddae96e4d1dc068b8ab7b56a52c9f4a', // SHA-256 hash of 'Sby12345'
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
          "'+62 82141837093",
          'Ngoro, Kec. Ngoro, Kabupaten Mojokerto, Jawa Timur 61385',
          13000,
          'SUDUT KO.FEE',
          'https://drive.google.com/file/d/1kXrn1knajYQbAujuFW5grLAglHtDfAnL/view?usp=sharing',
          'BCA Virtual Account',
          "'1360030935750",
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

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4A2E18');
      headerRange.setFontColor('#FAF5EE');
      sheet.setFrozenRows(1);

      if (cfg.initRows && cfg.initRows.length > 0) {
        cfg.initRows.forEach(function (row) {
          sheet.appendRow(row);
        });
      }
    }
  });

  return { success: true, message: 'Semua Sheet SUDUT KO.FEE berhasil disiapkan!' };
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : 'getAllData';

    if (action === 'init' || action === 'setupSheets') {
      return jsonResponse(setupSheets());
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

    // 1. Setup / Reset Sheets
    if (action === 'setupSheets' || action === 'init') {
      return jsonResponse(setupSheets());
    }

    // 2. Registrasi / Simpan / Update User (Otomatis Tambah atau Edit)
    if (
      action === 'registerUser' ||
      action === 'saveUser' ||
      action === 'updateUser' ||
      action === 'updateMemberStatus'
    ) {
      return jsonResponse(handleSaveUser(payload));
    }

    // 3. Simpan Kredensial User
    if (action === 'saveCredential') {
      return jsonResponse(handleSaveCredential(payload));
    }

    // 4. Hapus User / Member
    if (action === 'deleteUser') {
      return jsonResponse(handleDeleteUser(payload.uid || payload.id));
    }

    // 5. Buat Pesanan Baru (Online)
    if (action === 'createOrder') {
      return jsonResponse(handleCreateOrder(payload));
    }

    // 6. Update Status Pesanan (Admin)
    if (action === 'updateOrderStatus') {
      return jsonResponse(handleUpdateOrderStatus(payload));
    }

    // 7. Hapus Pesanan
    if (action === 'deleteOrder') {
      return jsonResponse(handleDeleteOrder(payload.id || payload.orderId));
    }

    // 8. Input Pesanan Kasir Manual (Offline)
    if (action === 'manualOfflineOrder') {
      return jsonResponse(handleManualOfflineOrder(payload));
    }

    // 9. Penukaran Hadiah / Redeem Reward
    if (action === 'redeemReward') {
      return jsonResponse(handleRedeemReward(payload));
    }

    // 10. CRUD Produk
    if (action === 'addProduct') {
      return jsonResponse(handleAddProduct(payload.product || payload));
    }
    if (action === 'updateProduct') {
      return jsonResponse(handleUpdateProduct(payload.id, payload.product || payload));
    }
    if (action === 'deleteProduct') {
      return jsonResponse(handleDeleteProduct(payload.id));
    }

    // 11. CRUD Reward
    if (action === 'addReward') {
      return jsonResponse(handleAddReward(payload.reward || payload));
    }
    if (action === 'updateReward') {
      return jsonResponse(handleUpdateReward(payload.id, payload.reward || payload));
    }
    if (action === 'deleteReward') {
      return jsonResponse(handleDeleteReward(payload.id));
    }

    // 12. Update Pengaturan Toko
    if (action === 'updateSettings') {
      return jsonResponse(handleUpdateSettings(payload.settings || payload));
    }

    // 13. Pembersihan Data Demo
    if (action === 'cleanupDemo') {
      return jsonResponse(handleCleanupDemo());
    }

    return jsonResponse({ success: false, message: 'Aksi POST tidak valid: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// =========================================================================
// HANDLERS PENAMBAHAN, PERUBAHAN & PENGHAPUSAN
// =========================================================================

/**
 * Menyimpan profil user: jika sudah ada maka diupdate, jika belum ada otomatis ditambah baris baru
 */
function handleSaveUser(payload) {
  const ss = getSS();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName('Users');
  }

  const user = payload.user || payload;
  const uid = user.uid || 'usr_' + Date.now().toString(36);
  const email = (user.email || '').trim().toLowerCase();
  const nama = user.nama || '';
  const noHp = sanitizeCell(user.noHp || '');
  const alamat = user.alamat || '';
  const role = user.role || 'user';
  const isMember = Boolean(user.isMember);
  const poin = Number(user.poin) || 0;
  const createdAt = user.createdAt || new Date().toISOString();

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('uid');
  const emailIdx = headers.indexOf('email');

  var existingRow = -1;
  for (var i = 1; i < data.length; i++) {
    if ((uid && data[i][uidIdx] === uid) || (email && String(data[i][emailIdx]).toLowerCase() === email)) {
      existingRow = i + 1;
      break;
    }
  }

  if (existingRow !== -1) {
    // Update baris yang sudah ada
    var namaIdx = headers.indexOf('nama');
    var noHpIdx = headers.indexOf('noHp');
    var alamatIdx = headers.indexOf('alamat');
    var roleIdx = headers.indexOf('role');
    var isMemberIdx = headers.indexOf('isMember');
    var poinIdx = headers.indexOf('poin');

    if (nama && namaIdx !== -1) sheet.getRange(existingRow, namaIdx + 1).setValue(nama);
    if (noHp && noHpIdx !== -1) sheet.getRange(existingRow, noHpIdx + 1).setValue(noHp);
    if (alamat && alamatIdx !== -1) sheet.getRange(existingRow, alamatIdx + 1).setValue(alamat);
    if (role && roleIdx !== -1) sheet.getRange(existingRow, roleIdx + 1).setValue(role);
    if (isMemberIdx !== -1) sheet.getRange(existingRow, isMemberIdx + 1).setValue(isMember);
    if (poinIdx !== -1 && user.poin !== undefined) sheet.getRange(existingRow, poinIdx + 1).setValue(poin);

    return { success: true, action: 'updated', uid: uid };
  } else {
    // Tambah baris baru jika belum ada
    sheet.appendRow([uid, nama, email, noHp, alamat, role, isMember, poin, createdAt]);
    return { success: true, action: 'created', uid: uid };
  }
}

/**
 * Menyimpan kredensial keamanan pengguna ke UserCredentials
 */
function handleSaveCredential(payload) {
  const ss = getSS();
  var sheet = ss.getSheetByName('UserCredentials');
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName('UserCredentials');
  }

  const uid = payload.uid;
  const email = (payload.email || '').trim().toLowerCase();
  const salt = payload.salt || '';
  const passwordHash = payload.passwordHash || '';
  const updatedAt = payload.updatedAt || new Date().toISOString();

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('uid');

  for (var i = 1; i < data.length; i++) {
    if (data[i][uidIdx] === uid) {
      var pCol = headers.indexOf('passwordHash');
      var sCol = headers.indexOf('salt');
      var uCol = headers.indexOf('updatedAt');
      if (pCol !== -1) sheet.getRange(i + 1, pCol + 1).setValue(passwordHash);
      if (sCol !== -1) sheet.getRange(i + 1, sCol + 1).setValue(salt);
      if (uCol !== -1) sheet.getRange(i + 1, uCol + 1).setValue(updatedAt);
      return { success: true };
    }
  }

  sheet.appendRow([uid, email, salt, passwordHash, updatedAt]);
  return { success: true };
}

/**
 * Hapus user dari Users dan UserCredentials di spreadsheet
 */
function handleDeleteUser(uid) {
  if (!uid) return { success: false, error: 'UID tidak boleh kosong' };
  const ss = getSS();

  // 1. Hapus dari sheet Users
  const uSheet = ss.getSheetByName('Users');
  if (uSheet) {
    const uData = uSheet.getDataRange().getValues();
    const uidIdx = uData[0].indexOf('uid');
    for (var i = uData.length - 1; i >= 1; i--) {
      if (uData[i][uidIdx] === uid) {
        uSheet.deleteRow(i + 1);
      }
    }
  }

  // 2. Hapus dari sheet UserCredentials
  const cSheet = ss.getSheetByName('UserCredentials');
  if (cSheet) {
    const cData = cSheet.getDataRange().getValues();
    const cUidIdx = cData[0].indexOf('uid');
    for (var j = cData.length - 1; j >= 1; j--) {
      if (cData[j][cUidIdx] === uid) {
        cSheet.deleteRow(j + 1);
      }
    }
  }

  return { success: true, message: 'User berhasil dihapus dari Spreadsheet' };
}

/**
 * Tambah pesanan online baru ke sheet Orders & potong stok produk
 */
function handleCreateOrder(payload) {
  const ss = getSS();
  var ordersSheet = ss.getSheetByName('Orders');
  var productsSheet = ss.getSheetByName('Products');
  if (!ordersSheet) {
    setupSheets();
    ordersSheet = ss.getSheetByName('Orders');
    productsSheet = ss.getSheetByName('Products');
  }

  const id = payload.id || 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const itemsJson = typeof payload.items === 'string' ? payload.items : JSON.stringify(payload.items || []);

  ordersSheet.appendRow([
    id,
    payload.userId || '',
    payload.userName || '',
    sanitizeCell(payload.userPhone || ''),
    payload.userAddress || '',
    itemsJson,
    Number(payload.total) || 0,
    payload.status || 'Menunggu',
    payload.metodeBayar || 'qris',
    payload.sumber || 'online',
    Number(payload.poinDidapat) || 0,
    payload.catatan || '',
    now,
    now
  ]);

  // Potong stok produk di spreadsheet
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
  } catch (err) {}

  return { success: true, orderId: id };
}

/**
 * Update status pesanan di sheet Orders
 */
function handleUpdateOrderStatus(payload) {
  const ss = getSS();
  const ordersSheet = ss.getSheetByName('Orders');
  const usersSheet = ss.getSheetByName('Users');
  const historySheet = ss.getSheetByName('PointHistory');

  if (!ordersSheet) return { success: false, error: 'Sheet Orders tidak ditemukan' };

  const orderId = payload.orderId || payload.id;
  const newStatus = payload.newStatus || payload.status;
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
        addPointsToMember(
          usersSheet,
          historySheet,
          userId,
          poinDidapat,
          'Poin pesanan #' + orderId.slice(0, 6) + ' (' + sumber + ')'
        );
      }

      return { success: true };
    }
  }

  return { success: false, error: 'Pesanan ' + orderId + ' tidak ditemukan' };
}

/**
 * Hapus pesanan dari sheet Orders
 */
function handleDeleteOrder(orderId) {
  if (!orderId) return { success: false, error: 'ID Pesanan wajib diisi' };
  const ss = getSS();
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return { success: false, error: 'Sheet Orders tidak ditemukan' };

  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idIdx] === orderId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Pesanan #' + orderId + ' berhasil dihapus dari Spreadsheet' };
    }
  }

  return { success: false, error: 'Pesanan tidak ditemukan' };
}

/**
 * Input manual offline order dari kasir
 */
function handleManualOfflineOrder(payload) {
  const ss = getSS();
  var ordersSheet = ss.getSheetByName('Orders');
  var usersSheet = ss.getSheetByName('Users');
  var historySheet = ss.getSheetByName('PointHistory');
  if (!ordersSheet) {
    setupSheets();
    ordersSheet = ss.getSheetByName('Orders');
    usersSheet = ss.getSheetByName('Users');
    historySheet = ss.getSheetByName('PointHistory');
  }

  const id = payload.id || 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const itemsJson = typeof payload.items === 'string' ? payload.items : JSON.stringify(payload.items || []);

  ordersSheet.appendRow([
    id,
    payload.memberId || '',
    payload.memberName || '',
    sanitizeCell(payload.memberPhone || ''),
    '',
    itemsJson,
    Number(payload.total) || 0,
    payload.status || 'Selesai',
    payload.metodeBayar || 'qris',
    'offline',
    Number(payload.poinDidapat) || 0,
    payload.catatan || 'Transaksi kasir offline',
    now,
    now
  ]);

  if (payload.status === 'Selesai' && payload.poinDidapat > 0 && payload.memberId && usersSheet) {
    addPointsToMember(
      usersSheet,
      historySheet,
      payload.memberId,
      Number(payload.poinDidapat),
      'Poin belanja offline #' + id.slice(0, 6)
    );
  }

  return { success: true, orderId: id };
}

/**
 * Penukaran hadiah (redeem reward)
 */
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
  if (usersSheet) {
    const uData = usersSheet.getDataRange().getValues();
    const uHeaders = uData[0];
    const uIdIdx = uHeaders.indexOf('uid');
    const uPoinIdx = uHeaders.indexOf('poin');
    for (var i = 1; i < uData.length; i++) {
      if (uData[i][uIdIdx] === userId) {
        var curPoin = Number(uData[i][uPoinIdx]) || 0;
        usersSheet.getRange(i + 1, uPoinIdx + 1).setValue(Math.max(0, curPoin - poinDipakai));
        break;
      }
    }
  }

  // 2. Kurangi stok reward
  if (rewardsSheet) {
    const rData = rewardsSheet.getDataRange().getValues();
    const rHeaders = rData[0];
    const rIdIdx = rHeaders.indexOf('id');
    const rStokIdx = rHeaders.indexOf('stok');
    for (var r = 1; r < rData.length; r++) {
      if (rData[r][rIdIdx] === rewardId) {
        var curStok = Number(rData[r][rStokIdx]) || 0;
        rewardsSheet.getRange(r + 1, rStokIdx + 1).setValue(Math.max(0, curStok - 1));
        break;
      }
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
      'Penukaran reward: ' + (payload.namaReward || 'Hadiah'),
      now
    ]);
  }

  // 4. Catat di Redemptions
  if (redemptionsSheet) {
    redemptionsSheet.appendRow([
      'rdm_' + Date.now().toString(36),
      userId,
      payload.userName || '',
      rewardId,
      payload.namaReward || '',
      poinDipakai,
      'Selesai',
      now
    ]);
  }

  return { success: true };
}

/**
 * Tambah Produk
 */
function handleAddProduct(product) {
  const ss = getSS();
  var sheet = ss.getSheetByName('Products');
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName('Products');
  }

  const id = product.id || 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  sheet.appendRow([
    id,
    product.nama || '',
    product.deskripsi || '',
    Number(product.harga) || 0,
    Number(product.stok) || 0,
    product.kategori || 'Coffee',
    product.gambar || '',
    product.createdAt || now,
    product.updatedAt || now
  ]);

  return { success: true, id: id };
}

/**
 * Update Produk
 */
function handleUpdateProduct(id, product) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return { success: false, error: 'Sheet Products tidak ditemukan' };

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

/**
 * Hapus Produk dari Sheet Products
 */
function handleDeleteProduct(id) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return { success: false, error: 'Sheet Products tidak ditemukan' };

  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Produk berhasil dihapus dari Spreadsheet' };
    }
  }
  return { success: false, error: 'Produk tidak ditemukan' };
}

/**
 * Tambah Reward
 */
function handleAddReward(reward) {
  const ss = getSS();
  var sheet = ss.getSheetByName('Rewards');
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName('Rewards');
  }

  const id = reward.id || 'rew_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  sheet.appendRow([
    id,
    reward.nama || '',
    reward.deskripsi || '',
    Number(reward.poinDibutuhkan) || 10,
    Number(reward.stok) || 0,
    reward.gambar || '',
    reward.createdAt || now
  ]);

  return { success: true, id: id };
}

/**
 * Update Reward
 */
function handleUpdateReward(id, reward) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Rewards');
  if (!sheet) return { success: false, error: 'Sheet Rewards tidak ditemukan' };

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

/**
 * Hapus Reward dari Sheet Rewards
 */
function handleDeleteReward(id) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Rewards');
  if (!sheet) return { success: false, error: 'Sheet Rewards tidak ditemukan' };

  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Reward berhasil dihapus dari Spreadsheet' };
    }
  }
  return { success: false, error: 'Reward tidak ditemukan' };
}

/**
 * Update Settings Toko
 */
function handleUpdateSettings(newSettings) {
  const ss = getSS();
  var sheet = ss.getSheetByName('Settings');
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName('Settings');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  Object.keys(newSettings).forEach(function (key) {
    var col = headers.indexOf(key);
    if (col !== -1) {
      var val = newSettings[key];
      if (key === 'kontak' || key === 'bankAccountNumber') {
        val = sanitizeCell(val);
      }
      sheet.getRange(2, col + 1).setValue(val);
    }
  });

  return { success: true };
}

/**
 * Pembersihan Data Demo
 */
function handleCleanupDemo() {
  const ss = getSS();

  // Hapus akun demo dari Users
  const uSheet = ss.getSheetByName('Users');
  if (uSheet) {
    const uData = uSheet.getDataRange().getValues();
    for (var i = uData.length - 1; i >= 1; i--) {
      var name = String(uData[i][1] || '').toLowerCase();
      var email = String(uData[i][2] || '').toLowerCase();
      if ((name.indexOf('demo') !== -1 || email.indexOf('demo') !== -1) && email !== 'bangbuntu@gmail.com') {
        uSheet.deleteRow(i + 1);
      }
    }
  }

  // Hapus pesanan demo dari Orders
  const oSheet = ss.getSheetByName('Orders');
  if (oSheet) {
    const oData = oSheet.getDataRange().getValues();
    for (var j = oData.length - 1; j >= 1; j--) {
      var oName = String(oData[j][2] || '').toLowerCase();
      var oId = String(oData[j][0] || '').toLowerCase();
      if (oName.indexOf('demo') !== -1 || oId.indexOf('demo') !== -1) {
        oSheet.deleteRow(j + 1);
      }
    }
  }

  return { success: true, message: 'Data demo dibersihkan' };
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
