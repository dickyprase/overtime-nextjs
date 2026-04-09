# Sistem Karyawan - Overtime Management System

Aplikasi manajemen lembur karyawan berbasis web yang dibangun menggunakan **Next.js 14** dan **Supabase**. Sistem ini memungkinkan karyawan untuk mencatat jam lembur, mengelola pendapatan tambahan, serta melihat rekapitulasi dan arus kas secara terperinci. Dilengkapi panel admin untuk manajemen pengguna dan backup data.

---

## Fitur Utama

- **Autentikasi** — Login, register, dan manajemen sesi menggunakan JWT.
- **Pencatatan Lembur** — Input jam lembur harian dengan kalkulasi otomatis berdasarkan gaji pokok, uang makan, dan status hari (weekday/weekend/libur).
- **Pencatatan Pendapatan** — Catat pendapatan tambahan di luar lembur.
- **Rekapitulasi Per Periode** — Ringkasan lembur per periode mingguan (Kamis–Rabu) dengan tanggal pencairan.
- **Cashflow** — Laporan arus kas gabungan dari lembur yang sudah cair dan pendapatan lainnya.
- **Profil Pengguna** — Ubah nama, gaji, uang makan, Telegram ID, nomor telepon, dan password.
- **Panel Admin** — Kelola pengguna, reset password, lihat semua data lembur, dan download backup.
- **Auto-Detect Uang Makan** — Secara otomatis mendeteksi hari kerja yang belum diinput dan menambahkan uang makan.
- **Migrasi Database** — Endpoint otomatis untuk mengecek dan menyiapkan tabel database.

---

## Tech Stack

| Komponen       | Teknologi                  |
| -------------- | -------------------------- |
| Framework      | Next.js 14 (App Router)    |
| Database       | Supabase (PostgreSQL)      |
| Autentikasi    | JWT (jose library)         |
| Bahasa         | JavaScript (ES Modules)    |
| Styling        | CSS + Google Fonts (Inter) |

---

## Prasyarat

Sebelum instalasi, pastikan Anda sudah memiliki:

1. **Node.js** versi 18 atau lebih baru — [Download Node.js](https://nodejs.org/)
2. **npm** (sudah termasuk dalam instalasi Node.js)
3. **Akun Supabase** — [Daftar gratis di supabase.com](https://supabase.com/)

---

## Instalasi & Menjalankan Aplikasi

### 1. Clone Repository

```bash
git clone <url-repository>
cd overtime-nextjs-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Project Supabase

1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"** dan isi detail project
3. Tunggu hingga project selesai dibuat

### 4. Setup Database

1. Di dashboard Supabase, buka menu **SQL Editor** di sidebar kiri
2. Klik **"+ New Query"**
3. Copy-paste seluruh isi file `supabase-schema.sql` yang ada di root project
4. Klik **"Run"** untuk membuat semua tabel dan data awal

### 5. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
JWT_SECRET=your-custom-secret-key
```

Cara mendapatkan nilai-nilai di atas:
- **NEXT_PUBLIC_SUPABASE_URL** → Supabase Dashboard > Settings > API > Project URL
- **SUPABASE_SERVICE_ROLE_KEY** → Supabase Dashboard > Settings > API > Service Role Key (secret)
- **JWT_SECRET** → Buat string acak sendiri (opsional, default: `overtime-secret-key-2024`)

### 6. Jalankan Aplikasi (Development)

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

### 7. Verifikasi Database (Opsional)

Buka browser dan akses:

```
http://localhost:3000/api/migrate
```

Endpoint ini akan mengecek apakah semua tabel sudah siap dan membuat default admin jika belum ada.

### 8. Build untuk Production

```bash
npm run build
npm start
```

---

## Akun Default

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| Admin | `admin`  | `admin123` |

> **Catatan:** Segera ubah password default setelah login pertama kali.

---

## Struktur Project

```
overtime-nextjs-main/
├── app/
│   ├── api/                  # API Routes (backend)
│   │   ├── admin/            # Endpoint admin (backup, overtime all)
│   │   ├── cashflow/         # Endpoint cashflow
│   │   ├── config/           # Endpoint konfigurasi
│   │   ├── docs/             # Dokumentasi API (auto-generated)
│   │   ├── income/           # Endpoint pendapatan
│   │   ├── login/            # Endpoint login
│   │   ├── logout/           # Endpoint logout
│   │   ├── me/               # Endpoint user session
│   │   ├── migrate/          # Endpoint migrasi database
│   │   ├── overtime/         # Endpoint lembur
│   │   ├── profile/          # Endpoint profil & password
│   │   ├── register/         # Endpoint registrasi
│   │   ├── rekap/            # Endpoint rekapitulasi
│   │   └── users/            # Endpoint manajemen user (admin)
│   ├── api-docs/             # Halaman dokumentasi API
│   ├── dashboard/            # Halaman dashboard
│   ├── login/                # Halaman login
│   ├── globals.css           # Stylesheet global
│   ├── layout.js             # Root layout
│   └── page.js               # Halaman utama (redirect)
├── config/
│   └── config.json           # Konfigurasi aplikasi
├── data/                     # Data JSON (legacy/fallback)
├── lib/
│   ├── auth.js               # Helper autentikasi JWT
│   ├── config.js             # Helper konfigurasi
│   ├── db.js                 # Database operations (Supabase)
│   ├── migrate.js            # Helper migrasi tabel
│   ├── overtime-calc.js      # Logika kalkulasi lembur
│   └── supabase.js           # Supabase client
├── public/
│   └── dashboard.html        # Dashboard HTML statis
├── supabase-schema.sql       # SQL schema untuk Supabase
├── package.json
└── next.config.mjs
```

---

## Dokumentasi API

Semua endpoint API menggunakan format JSON. Autentikasi dilakukan melalui cookie JWT (`overtime_session`) yang otomatis dikirim browser setelah login.

### Autentikasi

#### `POST /api/login`
Login user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "salary": 0,
    "mealAllowance": 0
  }
}
```

---

#### `POST /api/register`
Registrasi user baru.

**Request Body:**
```json
{
  "username": "budi",
  "password": "password123",
  "name": "Budi Santoso"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "1712345678",
    "username": "budi",
    "name": "Budi Santoso",
    "role": "user",
    "salary": 5000000,
    "mealAllowance": 25000
  }
}
```

**Validasi:**
- Username: 3–50 karakter, hanya huruf, angka, underscore, dan dash
- Password: 3–100 karakter
- Nama: minimal 2 karakter

---

#### `POST /api/logout`
Logout dan hapus sesi.

**Response (200):**
```json
{ "success": true }
```

---

#### `GET /api/me`
Mendapatkan data user yang sedang login.

**Response (200):**
```json
{
  "id": "1",
  "username": "admin",
  "name": "Administrator",
  "role": "admin",
  "salary": 5000000,
  "mealAllowance": 25000,
  "telegram_id": null,
  "phone": null
}
```

---

### Lembur (Overtime)

#### `GET /api/overtime`
Mendapatkan semua data lembur milik user yang login.

**Response (200):** Array of overtime records
```json
[
  {
    "id": "1712345678",
    "user_id": "2",
    "user_name": "Budi",
    "date": "2024-04-01",
    "day": "Senin",
    "hours": 2,
    "endTime": "19:00",
    "isHoliday": false,
    "amount": 78500,
    "period_start": "2024-03-28",
    "period_end": "2024-04-03",
    "payment_date": "2024-04-12",
    "status": "belum"
  }
]
```

---

#### `POST /api/overtime`
Menambahkan data lembur baru.

**Request Body:**
```json
{
  "date": "2024-04-01",
  "hours": 2,
  "isHoliday": false,
  "endTime": "19:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "record": { ... }
}
```

> Kalkulasi jumlah lembur (`amount`) dilakukan otomatis berdasarkan gaji, uang makan, dan hari.

---

#### `PUT /api/overtime/:id`
Mengubah data lembur berdasarkan ID.

**Request Body (partial update):**
```json
{
  "hours": 3,
  "isHoliday": false,
  "endTime": "20:00",
  "status": "cair"
}
```

**Response (200):**
```json
{
  "success": true,
  "record": { ... }
}
```

---

#### `DELETE /api/overtime/:id`
Menghapus data lembur berdasarkan ID.

**Response (200):**
```json
{ "success": true }
```

---

#### `GET /api/overtime/period?start=YYYY-MM-DD&end=YYYY-MM-DD`
Mendapatkan data lembur berdasarkan periode, termasuk auto-detect hari kerja kosong.

**Query Parameters:**
- `start` — Tanggal awal periode (format: `YYYY-MM-DD`)
- `end` — Tanggal akhir periode (format: `YYYY-MM-DD`)

**Response (200):**
```json
{
  "records": [ ... ],
  "period": { "start": "2024-03-28", "end": "2024-04-03" },
  "total": 250000,
  "rounded_total": 250000,
  "payment_date": "2024-04-12"
}
```

---

#### `PUT /api/overtime/period/status`
Mengubah status seluruh record dalam satu periode.

**Request Body:**
```json
{
  "start": "2024-03-28",
  "end": "2024-04-03",
  "status": "cair"
}
```

**Response (200):**
```json
{ "success": true }
```

---

### Pendapatan (Income)

#### `GET /api/income`
Mendapatkan semua data pendapatan milik user.

**Response (200):** Array of income records
```json
[
  {
    "id": "1712345678",
    "user_id": "2",
    "user_name": "Budi",
    "date": "2024-04-01",
    "type": "bonus",
    "amount": 500000,
    "note": "Bonus bulanan"
  }
]
```

---

#### `POST /api/income`
Menambahkan data pendapatan baru.

**Request Body:**
```json
{
  "date": "2024-04-01",
  "type": "bonus",
  "amount": 500000,
  "note": "Bonus bulanan"
}
```

**Response (200):**
```json
{
  "success": true,
  "record": { ... }
}
```

---

#### `DELETE /api/income/:id`
Menghapus data pendapatan berdasarkan ID.

**Response (200):**
```json
{ "success": true }
```

---

### Cashflow

#### `GET /api/cashflow?month=MM&year=YYYY`
Laporan arus kas gabungan dari lembur yang sudah cair dan pendapatan.

**Query Parameters (opsional):**
- `month` — Bulan (1–12)
- `year` — Tahun (contoh: 2024)

**Response (200):**
```json
{
  "income": [ ... ],
  "overtime": [ ... ],
  "summary": {
    "total_income": 500000,
    "total_overtime": 250000,
    "grand_total": 750000
  }
}
```

---

### Rekapitulasi (Rekap)

#### `GET /api/rekap/periods?month=MM&year=YYYY`
Mendapatkan rekapitulasi lembur per periode mingguan.

**Query Parameters (opsional):**
- `month` — Bulan (1–12)
- `year` — Tahun (contoh: 2024)

**Response (200):** Array of period objects
```json
[
  {
    "start": "2024-03-28",
    "end": "2024-04-03",
    "start_formatted": "28 Maret 2024",
    "end_formatted": "3 April 2024",
    "payment_date": "2024-04-12",
    "payment_date_formatted": "12 April 2024",
    "records": [ ... ],
    "total": 250000,
    "rounded_total": 250000,
    "all_cair": false
  }
]
```

---

#### `PUT /api/rekap/period/status`
Mengubah status periode dan otomatis menyimpan hari kerja yang belum tercatat.

**Request Body:**
```json
{
  "start": "2024-03-28",
  "end": "2024-04-03",
  "status": "cair",
  "realAmount": 250000
}
```

**Nilai `status` yang tersedia:**
- `belum` — Belum cair
- `cair` — Sudah cair (sesuai kalkulasi)
- `cair_mismatch` — Sudah cair tapi jumlah berbeda dari kalkulasi

**Response (200):**
```json
{
  "success": true,
  "updated": 5,
  "newEntries": 2
}
```

---

### Profil

#### `PUT /api/profile`
Mengubah data profil user yang login.

**Request Body (partial update):**
```json
{
  "name": "Budi Santoso",
  "salary": 6000000,
  "mealAllowance": 30000,
  "telegram_id": "123456789",
  "phone": "08123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### `PUT /api/profile/password`
Mengubah password user yang login.

**Request Body:**
```json
{
  "currentPassword": "password_lama",
  "newPassword": "password_baru"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

### Konfigurasi

#### `GET /api/config`
Mendapatkan konfigurasi aplikasi.

**Response (200):**
```json
{
  "companyName": "PT. ABCD",
  "defaultSalary": 5000000,
  "defaultMealAllowance": 25000
}
```

---

### Admin (Khusus Admin)

> Semua endpoint admin memerlukan role `admin`. Response `403` jika bukan admin.

#### `GET /api/users`
Mendapatkan daftar semua user (tanpa password).

**Response (200):**
```json
[
  {
    "id": "1",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "salary": 0,
    "mealAllowance": 0,
    "telegram_id": null,
    "phone": null
  }
]
```

---

#### `POST /api/users`
Membuat user baru.

**Request Body:**
```json
{
  "username": "budi",
  "password": "123",
  "name": "Budi Santoso",
  "role": "user",
  "telegram_id": null,
  "phone": "08123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### `PUT /api/users/:id`
Mengubah data user oleh admin.

**Request Body (partial update):**
```json
{
  "name": "Budi S.",
  "telegram_id": "123456789",
  "phone": "08123456789"
}
```

---

#### `DELETE /api/users/:id`
Menghapus user berdasarkan ID.

---

#### `POST /api/users/:id/reset-password`
Reset password user ke `123`.

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset to 123"
}
```

---

#### `GET /api/admin/overtime/all`
Mendapatkan semua data lembur dari semua user.

---

#### `GET /api/admin/backup`
Download backup seluruh data (users, overtime, income, config) dalam format JSON.

---

### Sistem

#### `GET /api/migrate`
Mengecek status tabel database dan membuat default admin/config jika belum ada. Jika tabel belum dibuat, akan menampilkan SQL schema yang perlu dijalankan manual di Supabase SQL Editor.

---

## Rumus Perhitungan Lembur

| Kondisi                  | Rumus                                              |
| ------------------------ | -------------------------------------------------- |
| Hari kerja, 0 jam        | Uang makan saja                                    |
| Hari kerja, 1 jam        | (Gaji/173 × 1.5) + Uang makan                     |
| Hari kerja, 1.5 jam      | (Gaji/173 × 2.5) + Uang makan                     |
| Hari kerja, 2 jam        | (Gaji/173 × 3.5) + Uang makan                     |
| Hari kerja, 2.5 jam      | (Gaji/173 × 4.5) + Uang makan                     |
| Hari kerja, 3 jam        | (Gaji/173 × 5.5) + Uang makan                     |
| Weekend/Libur            | (Gaji/173 × 2 × jam) + Uang makan                 |
| Tidak lembur (-1)        | Rp 0                                               |

> Angka **173** adalah standar jam kerja per bulan yang digunakan sebagai pembagi gaji pokok.

---

## Periode Mingguan

Sistem menggunakan periode **Kamis–Rabu** untuk perhitungan lembur:
- **Awal periode:** Kamis
- **Akhir periode:** Rabu
- **Tanggal pencairan:** 9 hari setelah akhir periode (Jumat minggu berikutnya)

---

## Lisensi

Proyek ini dibuat untuk keperluan internal manajemen lembur karyawan.
