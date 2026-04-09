# Overtime Management System API Documentation

Dokumentasi ini berisi detail spesifikasi untuk seluruh endpoint pada Overtime Management System. Endpoint ini digunakan untuk manajemen data pengguna, rekapitulasi lembur, dan cashflow bulanan.

---

## 1. Auth

### POST `/api/login`
Autentikasi user dan akan mengeset cookie `overtime_session`.
- **Request Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_12345678",
      "username": "admin",
      "name": "Administrator",
      "role": "admin",
      "salary": 15000,
      "mealAllowance": 30000
    }
  }
  ```

### POST `/api/logout`
Menghapus sesi pengguna dengan membersihkan cookie.
- **Response (200 OK):**
  ```json
  {
    "success": true
  }
  ```

### POST `/api/register`
Mendaftarkan akun baru dan langsung membuat sesi login.
- **Request Body (JSON):**
  ```json
  {
    "name": "Budi Santoso",
    "username": "budi123",
    "password": "rahasia"
  }
  ```
- **Response (200 OK):** Sama seperti pada `/api/login`. Mengembalikan objek _User_.

### GET `/api/me`
Mengambil data user yang sedang login berdasarkan cookie valid yang tersedia.
- **Response (200 OK):** Mengembalikan object JSON data _User_.

---

## 2. Users (Admin Only)

### GET `/api/users`
Mengambil daftar semua akun pengguna di sistem.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "usr_12345678",
      "username": "admin",
      "name": "Administrator",
      "role": "admin",
      "salary": 15000,
      "mealAllowance": 30000,
      "telegram_id": "682138123",
      "phone": "08123456789"
    }
  ]
  ```

### POST `/api/users`
Membuat user baru secara manual.
- **Request Body (JSON):**
  ```json
  {
    "username": "budi_baru",
    "password": "password123",
    "name": "Budi Baru",
    "role": "user",
    "telegram_id": "12312312",
    "phone": "08111222333"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { "id": "...", "name": "Budi Baru" }
  }
  ```

### PUT `/api/users/{id}`
Update data user tertentu berdasarkan *ID*.
- **Request Body (JSON):** (semua properti ini opsional)
  ```json
  {
    "name": "Budi Update",
    "salary": 20000,
    "mealAllowance": 35000,
    "telegram_id": "12312312",
    "phone": "08111222333"
  }
  ```
- **Response (200 OK):**
  ```json
  { "success": true }
  ```

### DELETE `/api/users/{id}`
Menghapus user tertentu (Soft/Hard delete tergantung implementasi).
- **Response (200 OK):** Berhasil dihapus.

### POST `/api/users/{id}/reset-password`
Semacam _force_ ubah password agar password akun menjadi default (misalnya `123` atau `password123` sesuai dengan pengaturan).
- **Response (200 OK):** Password berhasil di-reset.

---

## 3. Profile

### PUT `/api/profile`
Ubah informasi pengaturan profil akun user yang sedang aktif.
- **Request Body (JSON):** (hanya ubah properti yang diperlukan)
  ```json
  {
    "name": "Namaku Siapa",
    "salary": 20000,
    "mealAllowance": 40000,
    "telegram_id": "12312312",
    "phone": "08123456789"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { "... updated user ..." }
  }
  ```

### PUT `/api/profile/password`
Ubah kata sandi secara mandiri.
- **Request Body (JSON):**
  ```json
  {
    "currentPassword": "password_lama",
    "newPassword": "password_baru"
  }
  ```
- **Response (200 OK):** Berhasil diubah.

---

## 4. Overtime (Lembur)

### GET `/api/overtime`
Mengambil semua data riwayat absensi / lembur user terkait.
- **Response (200 OK):** Mengembalikan _Array of OvertimeRecord_ (contoh di bawah)

### POST `/api/overtime`
Memasukan entri absensi harian baru.
- **Request Body (JSON):**
  ```json
  {
    "date": "2025-10-15",
    "hours": 2.5,
    "endTime": "19:30",
    "isHoliday": false
  }
  ```

#### Penjelasan Detail Input Jam (`hours`):
Nilai `hours` bisa bermacam-macam tipe dengan efek kalkulasi pembayaran (`amount`) yang berbeda:

1. **`hours: -1` (Mangkir / Tidak Masuk)**
   - Jika karyawan tidak masuk sama sekali di hari kerja. 
   - Hasil Kalkulasi yang didapat nilainya **0** (kosong).

2. **`hours: 0` (Masuk Kerja Normal / Pulang Tepat Waktu)**
   - Karyawan masuk, tapi tidak ada jam lembur *(nol jam lembur)*.
   - Hasil Kalkulasi: 
     - **Hari Kerja Biasa**: Mendapatkan penuh nilai **`mealAllowance`** (uang makan dasar).
     - **Hari Libur (`isHoliday: true`) / Weekend**: Mendapatkan **0**.

3. **`hours: > 0` (Ada Jam Lembur Tambahan)**
   - Ini adalah nilai sebenarnya durasi lembur (contoh: `1.5` atau `3`).
   - Hasil Kalkulasi:
     - **Hari Libur/Weekend (`isHoliday: true` / Sabtu-Minggu)**: Dikalikan rata *rate = 2* (`(salary ÷ 173) × 2 × hours + mealAllowance`).
     - **Hari Kerja Biasa**: Dikalikan dengan rate progresif / multiplier berdasarkan kelipatan jam. 
       - `1` jam => dikali rate `1.5`
       - `1.5` jam => dikali rate `2.5`
       - `2` jam => dikali rate `3.5`
       - `2.5` jam => dikali rate `4.5`
       - `3` jam => dikali rate `5.5`
       - Selebihnya menggunakan rumus default: `(salary ÷ 173) × (hours × 1.5) + mealAllowance`.

4. **Waktu Istirahat (Tidak Dihitung Lembur):**
   - Waktu istirahat pada jam **12:00 - 13:00** dan **18:00 - 18:30** adalah **tidak** dihitung sebagai durasi jam lembur masuk dalam inputan `hours`. Durasi jam lembur (`hours`) harus sudah dikurangi (netto) dari jam istirahat tersebut.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "record": {
      "id": "16928371",
      "user_id": "usr_123",
      "date": "2025-10-15",
      "day": "Rabu",
      "hours": 2.5,
      "endTime": "19:30",
      "isHoliday": false,
      "amount": 67500,
      "status": "belum"
    }
  }
  ```

### PUT `/api/overtime/{id}`
Mengubah absensi lama (Edit lemburan).
- **Request Body (JSON):**
  ```json
  {
    "hours": 3,
    "endTime": "20:00",
    "isHoliday": false,
    "status": "belum"
  }
  ```
- **Response (200 OK):** Mengembalikan 200 OK.

### DELETE `/api/overtime/{id}`
Hapus entri riwayat lembur tersebut.

---

## 5. Rekap

### GET `/api/rekap/periods`
Mengambil rekapitulasi data lembur mingguan / periodik yang memuat perhitungan final.
- **Query Parameters:** `?month=10&year=2025` (Opsional)
- **Response (200 OK):**
  ```json
  [
    {
      "start": "2025-10-14",
      "end": "2025-10-20",
      "payment_date": "2025-10-22",
      "total": 350000,
      "rounded_total": 350000,
      "all_cair": false,
      "records": [
         { "... Overtime Record 1 ..." },
         { "... Overtime Record 2 ..." }
      ]
    }
  ]
  ```

### PUT `/api/rekap/period/status`
Digunakan oleh user ketika periode tersebut sudah dicairkan / dibayarkan.
- **Request Body (JSON):**
  ```json
  {
    "start": "2025-10-14",
    "end": "2025-10-20",
    "status": "cair",
    "realAmount": 350000
  }
  ```
  _Catatan Status:_ `"belum"`, `"cair"`, `"cair_mismatch"`.

---

## 6. Income

### GET `/api/income`
Melihat daftar pendapatan bersih di luar lemburan yang dicatat manual.
- **Response (200 OK):** `[{ "id": "inc_123", "date": "2025-10-01", "type": "gaji", "amount": 5000000 }]`

### POST `/api/income`
Menambahkan riwayat penghasilan (misal bonus atau gaji utama).
- **Request Body (JSON):**
  ```json
  {
    "date": "2025-10-01",
    "type": "gaji",
    "amount": 5000000,
    "note": "Gaji Bulan Oktober"
  }
  ```
- **Response (200 OK):** `{ "success": true, "record": { ... } }`

### DELETE `/api/income/{id}`
Menghapus riwayat income.

---

## 7. Cashflow

### GET `/api/cashflow`
Kalkulasi ringkasan antara semua lembur masuk (yang sudah cair) digabungkan dengan Income/pendapatan.
- **Query Parameters:** `?month=10&year=2025` (Opsional)
- **Response (200 OK):**
  ```json
  {
    "incomes": [
      { "id": "inc_xyz", "type": "gaji", "amount": 5000000, "date": "2025-10-01" }
    ],
    "payouts": [
      {
         "start": "2025-10-14",
         "end": "2025-10-20",
         "payment_date": "2025-10-22",
         "total": 350000,
         "records": 5
      }
    ],
    "totalIncome": 5000000,
    "totalPayouts": 350000,
    "grandTotal": 5350000
  }
  ```

---

## 8. Config & Admin

### GET `/api/config`
Data preferensi / pengaturan global statis.
- **Response (200 OK):** `{ "companyName": "PT Teknologi Digital" }`

### GET `/api/admin/backup`
Men-download / membackup konfigurasi database dari seluruh sistem.
- **Response (200 OK):** Mengembalikan _raw JSON body_ berupa semua collection yang ada.

### GET `/api/admin/overtime/all`
Mengambil list seluruh entri lembur seluruh karyawan untuk analitik admin.
- **Response (200 OK):** `[ { ... OvertimeRecord (karyawan 1) ... }, { ... OvertimeRecord (karyawan 2) ... } ]`
