=====================================
 SISTEM KARYAWAN - OVERTIME MANAGEMENT SYSTEM
=====================================

Aplikasi manajemen lembur karyawan berbasis web menggunakan Next.js 14 dan Supabase.
Sistem ini memungkinkan karyawan mencatat jam lembur, mengelola pendapatan tambahan,
serta melihat rekapitulasi dan arus kas secara terperinci.


FITUR UTAMA
-----------
- Autentikasi (Login, Register, JWT Session)
- Pencatatan Lembur (kalkulasi otomatis berdasarkan gaji & uang makan)
- Pencatatan Pendapatan Tambahan
- Rekapitulasi Per Periode Mingguan (Kamis-Rabu)
- Laporan Cashflow (gabungan lembur cair & pendapatan)
- Profil Pengguna (ubah gaji, uang makan, password, dll)
- Panel Admin (kelola user, reset password, backup data)
- Auto-Detect Uang Makan untuk hari kerja kosong
- Migrasi Database Otomatis


TECH STACK
----------
- Framework  : Next.js 14 (App Router)
- Database   : Supabase (PostgreSQL)
- Auth       : JWT (jose library)
- Bahasa     : JavaScript (ES Modules)
- Styling    : CSS + Google Fonts (Inter)


PRASYARAT
---------
1. Node.js versi 18 atau lebih baru
   Download: https://nodejs.org/
2. npm (sudah termasuk dalam instalasi Node.js)
3. Akun Supabase
   Daftar: https://supabase.com/


INSTALASI & MENJALANKAN APLIKASI
---------------------------------

Langkah 1: Clone Repository
   git clone <url-repository>
   cd overtime-nextjs-main

Langkah 2: Install Dependencies
   npm install

Langkah 3: Buat Project Supabase
   - Buka https://supabase.com/dashboard
   - Klik "New Project" dan isi detail project
   - Tunggu hingga project selesai dibuat

Langkah 4: Setup Database
   - Di dashboard Supabase, buka menu "SQL Editor"
   - Klik "+ New Query"
   - Copy-paste seluruh isi file "supabase-schema.sql" dari root project
   - Klik "Run" untuk membuat semua tabel

Langkah 5: Konfigurasi Environment Variables
   Buat file ".env.local" di root project dengan isi:

   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
   JWT_SECRET=your-custom-secret-key

   Cara mendapatkan nilai di atas:
   - NEXT_PUBLIC_SUPABASE_URL  -> Supabase Dashboard > Settings > API > Project URL
   - SUPABASE_SERVICE_ROLE_KEY -> Supabase Dashboard > Settings > API > Service Role Key
   - JWT_SECRET                -> Buat string acak sendiri (opsional)

Langkah 6: Jalankan Aplikasi (Development)
   npm run dev

   Aplikasi berjalan di: http://localhost:3000

Langkah 7: Verifikasi Database (Opsional)
   Buka browser: http://localhost:3000/api/migrate
   Endpoint ini mengecek apakah semua tabel sudah siap.

Langkah 8: Build untuk Production
   npm run build
   npm start


AKUN DEFAULT
------------
Role     : Admin
Username : admin
Password : admin123

PENTING: Segera ubah password default setelah login pertama kali!


STRUKTUR PROJECT
-----------------
overtime-nextjs-main/
  app/
    api/           -> API Routes (backend)
    api-docs/      -> Halaman dokumentasi API
    dashboard/     -> Halaman dashboard
    login/         -> Halaman login
    globals.css    -> Stylesheet global
    layout.js      -> Root layout
    page.js        -> Halaman utama (redirect)
  config/
    config.json    -> Konfigurasi aplikasi
  data/            -> Data JSON (legacy/fallback)
  lib/
    auth.js        -> Helper autentikasi JWT
    config.js      -> Helper konfigurasi
    db.js          -> Database operations (Supabase)
    migrate.js     -> Helper migrasi tabel
    overtime-calc.js -> Logika kalkulasi lembur
    supabase.js    -> Supabase client
  public/
    dashboard.html -> Dashboard HTML statis
  supabase-schema.sql -> SQL schema untuk Supabase
  package.json
  next.config.mjs


RUMUS PERHITUNGAN LEMBUR
--------------------------
- Hari kerja, 0 jam       : Uang makan saja
- Hari kerja, 1 jam       : (Gaji/173 x 1.5) + Uang makan
- Hari kerja, 1.5 jam     : (Gaji/173 x 2.5) + Uang makan
- Hari kerja, 2 jam       : (Gaji/173 x 3.5) + Uang makan
- Hari kerja, 2.5 jam     : (Gaji/173 x 4.5) + Uang makan
- Hari kerja, 3 jam       : (Gaji/173 x 5.5) + Uang makan
- Weekend/Libur           : (Gaji/173 x 2 x jam) + Uang makan
- Tidak lembur (-1)       : Rp 0

Angka 173 = standar jam kerja per bulan sebagai pembagi gaji pokok.


PERIODE MINGGUAN
-----------------
- Awal periode    : Kamis
- Akhir periode   : Rabu
- Tanggal cair    : 9 hari setelah akhir periode (Jumat minggu berikutnya)


DOKUMENTASI API
----------------
Untuk dokumentasi API lengkap dengan contoh request/response,
silakan baca file README.md atau akses /api-docs di aplikasi.


=====================================
 Dibuat untuk manajemen lembur karyawan
=====================================
