import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Overtime Management System API',
    description: 'REST API untuk Sistem Manajemen Lembur Karyawan. Dokumentasi ini dibuat mendetail agar dapat dibaca sempurna oleh tools klien seperti OpenClaw, Postman, dan Swagger UI. Aplikasi ini menyediakan pengelolaan data lembur, pemasukan, cashflow, dan manajemen user.',
    version: '2.0.0',
    contact: { name: 'Support System' }
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local Development Server' },
    { url: '/', description: 'Relative to current origin' }
  ],
  tags: [
    { name: 'Auth', description: 'Autentikasi (login, register, logout, session info)' },
    { name: 'Users', description: 'Manajemen user (hanya admin)' },
    { name: 'Profile', description: 'Pengaturan profil user (update data & ubah password)' },
    { name: 'Overtime', description: 'Pengelolaan data lembur harian' },
    { name: 'Rekap', description: 'Rekapitulasi lembur dan pencairan per periode (umumnya mingguan)' },
    { name: 'Income', description: 'Manajemen data pemasukan uang (gaji, bonus, dsb)' },
    { name: 'Cashflow', description: 'Ringkasan laporan keuangan (cashflow) bulanan' },
    { name: 'Config', description: 'Konfigurasi global aplikasi' },
    { name: 'Admin', description: 'Fitur khusus admin (backup database, lihat semua overtime)' }
  ],
  paths: {
    '/api/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login User',
        description: 'Autentikasi user dan akan mengeset cookie `overtime_session`.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          },
          401: {
            description: 'Kredensial tidak valid',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout User',
        description: 'Menghapus sesi pengguna dengan membersihkan cookie.',
        operationId: 'logout',
        responses: {
          200: {
            description: 'Logout berhasil',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true } } } } }
          }
        }
      }
    },
    '/api/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register User Baru',
        description: 'Mendaftarkan akun baru dan langsung membuat sesi login.',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Registrasi berhasil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          },
          400: {
            description: 'Validasi gagal (misal: username sudah dipakai)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/me': {
      get: {
        tags: ['Auth'],
        summary: 'Informasi User Saat Ini',
        description: 'Mengambil data user yang sedang login berdasarkan cookie valid.',
        operationId: 'getMe',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Data user',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          401: {
            description: 'Belum login / Sesi expired',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List Semua User',
        description: 'Mengambil daftar semua akun pengguna di sistem (hanya admin).',
        operationId: 'listUsers',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar user',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
          },
          403: {
            description: 'Akses ditolak (Bukan admin)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Buat User Baru',
        description: 'Membuat user baru secara manual (hanya admin).',
        operationId: 'createUser',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserCreateRequest' } }
          }
        },
        responses: {
          200: {
            description: 'User berhasil dibuat',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, user: { $ref: '#/components/schemas/User' } } } } }
          },
          400: {
            description: 'Username sudah dipakai atau input invalid',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update User',
        description: 'Mengedit data user tertentu (hanya admin).',
        operationId: 'updateUser',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID user', schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserProfileUpdateRequest' } }
          }
        },
        responses: {
          200: { description: 'User berhasil diupdate', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true } } } } } },
          404: { description: 'User tidak ditemukan' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Hapus User',
        description: 'Menghapus user tertentu (hanya admin).',
        operationId: 'deleteUser',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID user', schema: { type: 'string' } }],
        responses: {
          200: { description: 'User berhasil dihapus' },
          404: { description: 'User tidak ditemukan' }
        }
      }
    },
    '/api/users/{id}/reset-password': {
      post: {
        tags: ['Users'],
        summary: 'Reset Password',
        description: 'Me-reset password user kembali ke default (contoh: 123) oleh admin.',
        operationId: 'resetPassword',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID user', schema: { type: 'string' } }],
        responses: {
          200: { description: 'Password berhasil direset' }
        }
      }
    },
    '/api/profile': {
      put: {
        tags: ['Profile'],
        summary: 'Update Profil Sendiri',
        description: 'Mengubah profil, setting telegram, gaji dasar dll dari user yang login.',
        operationId: 'updateProfile',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfileUpdateRequest' } } }
        },
        responses: {
          200: { description: 'Profil berhasil diupdate', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, user: { $ref: '#/components/schemas/User' } } } } } }
        }
      }
    },
    '/api/profile/password': {
      put: {
        tags: ['Profile'],
        summary: 'Ubah Password Sendiri',
        operationId: 'changePassword',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } }
        },
        responses: {
          200: { description: 'Password berhasil diubah' },
          400: { description: 'Password saat ini salah atau format invalid' }
        }
      }
    },
    '/api/overtime': {
      get: {
        tags: ['Overtime'],
        summary: 'Dapatkan Semua Riwayat Lembur',
        description: 'Mengambil seluruh data histori input lembur untuk user yang login.',
        operationId: 'getOvertimes',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar data lembur',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/OvertimeRecord' } } } }
          }
        }
      },
      post: {
        tags: ['Overtime'],
        summary: 'Input Lembur Baru',
        description: 'Menambahkan data lembur harian baru ke sistem.',
        operationId: 'createOvertime',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OvertimeCreateRequest' } } }
        },
        responses: {
          200: {
            description: 'Lembur berhasil disimpan',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, record: { $ref: '#/components/schemas/OvertimeRecord' } } } } }
          },
          400: { description: 'Validasi gagal (misal data pada tanggal tersebut sudah ada)' }
        }
      }
    },
    '/api/overtime/{id}': {
      put: {
        tags: ['Overtime'],
        summary: 'Edit Data Lembur',
        operationId: 'updateOvertime',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID Overtime', schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OvertimeUpdateRequest' } } }
        },
        responses: { 200: { description: 'Berhasil diupdate' } }
      },
      delete: {
        tags: ['Overtime'],
        summary: 'Hapus Data Lembur',
        operationId: 'deleteOvertime',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID Overtime', schema: { type: 'string' } }],
        responses: { 200: { description: 'Berhasil dihapus' } }
      }
    },
    '/api/rekap/periods': {
      get: {
        tags: ['Rekap'],
        summary: 'List Periode Rekap Lembur',
        description: 'Mengambil riwayat rekap lembur per-periode/per-minggu beserta total pembayaran.',
        operationId: 'getRekapPeriods',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', description: 'Bulan (1-12)', schema: { type: 'integer' } },
          { name: 'year', in: 'query', description: 'Tahun (YYYY)', schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Daftar periode lembur',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RekapPeriod' } } } }
          }
        }
      }
    },
    '/api/rekap/period/status': {
      put: {
        tags: ['Rekap'],
        summary: 'Ubah Status Percairan Periode',
        description: 'Menandai periode lembur menjadi cair (sudah dibayar) atau belum.',
        operationId: 'updateRekapStatus',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RekapStatusUpdateRequest' } } }
        },
        responses: { 200: { description: 'Status periode berhasil diupdate' } }
      }
    },
    '/api/income': {
      get: {
        tags: ['Income'],
        summary: 'List Pemasukan Lain',
        description: 'Mendapatkan daftar pemasukan (Income) seperti Gaji Dasar dan Dana Lainnya.',
        operationId: 'getIncomes',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar data income',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/IncomeRecord' } } } }
          }
        }
      },
      post: {
        tags: ['Income'],
        summary: 'Tambah Pemasukan',
        description: 'Menambahkan catatan pemasukan baru.',
        operationId: 'createIncome',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/IncomeCreateRequest' } } }
        },
        responses: { 200: { description: 'Income ditambahkan', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, record: { $ref: '#/components/schemas/IncomeRecord' } } } } } } }
      }
    },
    '/api/income/{id}': {
      delete: {
        tags: ['Income'],
        summary: 'Hapus Pemasukan',
        operationId: 'deleteIncome',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID Income', schema: { type: 'string' } }],
        responses: { 200: { description: 'Dihapus' } }
      }
    },
    '/api/cashflow': {
      get: {
        tags: ['Cashflow'],
        summary: 'Ringkasan Cashflow',
        description: 'Visualisasi dan kalkulasi cashflow yang merupakan gabungan Pemasukan dan Lembur Cair pada bulan tertentu.',
        operationId: 'getCashflow',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', description: 'Bulan (1-12)', schema: { type: 'integer' } },
          { name: 'year', in: 'query', description: 'Tahun (YYYY)', schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Data Cashflow',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CashflowResponse' } } }
          }
        }
      }
    },
    '/api/config': {
      get: {
        tags: ['Config'],
        summary: 'Get Global Config',
        description: 'Mendapat konfigurasi publik seperti Nama Perusahaan yang diset admin.',
        operationId: 'getConfig',
        responses: {
          200: {
            description: 'Konfigurasi',
            content: { 'application/json': { schema: { type: 'object', properties: { companyName: { type: 'string', example: 'PT Teknologi Digital' } } } } }
          }
        }
      }
    },
    '/api/admin/backup': {
      get: {
        tags: ['Admin'],
        summary: 'Download Database Backup',
        description: 'Mendapatkan seluruh JSON Database untuk di-backup.',
        operationId: 'downloadBackup',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'File JSON database',
            content: { 'application/json': { schema: { type: 'object', description: 'Berisi keseluruhan database key-value JSON' } } }
          },
          403: { description: 'Admin Only' }
        }
      }
    },
    '/api/admin/overtime/all': {
      get: {
        tags: ['Admin'],
        summary: 'Semua Lembur Karyawan',
        description: 'Data laporan semua lembur karyawan (Admin views).',
        operationId: 'getAllOvertimeAdmin',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List All Overtime',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/OvertimeRecord' } } } }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'overtime_session',
        description: 'Sesi yang disimpan di cookies setelah `POST /api/login` berjalan.'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Pesan error yang menjelaskan kesalahan' } }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_12345678' },
          username: { type: 'string', example: 'johndoe' },
          name: { type: 'string', example: 'John Doe' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          salary: { type: 'integer', description: 'Gaji lembur / jam / dasar', example: 15000 },
          mealAllowance: { type: 'integer', description: 'Tunjangan makan (uang makan)', example: 30000 },
          telegram_id: { type: 'string', nullable: true, example: '682138123' },
          phone: { type: 'string', nullable: true, example: '08123456789' },
          created_at: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00Z' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'admin123' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'password', 'name'],
        properties: {
          name: { type: 'string', example: 'Budi Santoso' },
          username: { type: 'string', example: 'budi123' },
          password: { type: 'string', example: 'rahasia' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      UserCreateRequest: {
        type: 'object',
        required: ['username', 'password', 'name'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
          telegram_id: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      UserProfileUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          salary: { type: 'integer' },
          mealAllowance: { type: 'integer' },
          telegram_id: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string' }
        }
      },
      OvertimeRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '16928371' },
          user_id: { type: 'string', example: 'usr_xyz' },
          date: { type: 'string', format: 'date', example: '2025-10-15' },
          day: { type: 'string', example: 'Senin' },
          hours: { type: 'number', description: 'Jumlah jam lembur. -1=Mangkir, 0=Tanpa Lembur, >0=Lembur', example: 2.5 },
          endTime: { type: 'string', example: '19:30', nullable: true },
          isHoliday: { type: 'boolean', example: false },
          amount: { type: 'integer', description: 'Nominal kalkulasi yang didapat', example: 67500 },
          period_start: { type: 'string', format: 'date', example: '2025-10-14' },
          period_end: { type: 'string', format: 'date', example: '2025-10-20' },
          payment_date: { type: 'string', format: 'date', example: '2025-10-25' },
          status: { type: 'string', enum: ['belum', 'cair'], example: 'belum' },
          cair_mismatch: { type: 'boolean', example: false },
          real_amount: { type: 'integer', nullable: true },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      OvertimeCreateRequest: {
        type: 'object',
        required: ['date', 'hours'],
        properties: {
          date: { type: 'string', format: 'date', example: '2025-10-15' },
          hours: { type: 'number', example: 1.5, description: '-1 jika mangkir/absen, 0 jika hanya isi uang makan, >0 jam lembur' },
          isHoliday: { type: 'boolean', default: false },
          endTime: { type: 'string', example: '18:30' }
        }
      },
      OvertimeUpdateRequest: {
        type: 'object',
        properties: {
          hours: { type: 'number' },
          isHoliday: { type: 'boolean' },
          endTime: { type: 'string' },
          status: { type: 'string', enum: ['belum', 'cair'] }
        }
      },
      RekapPeriod: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date', example: '2025-10-14' },
          end: { type: 'string', format: 'date', example: '2025-10-20' },
          payment_date: { type: 'string', format: 'date', example: '2025-10-22' },
          total: { type: 'integer', example: 350000 },
          rounded_total: { type: 'integer', example: 350000 },
          all_cair: { type: 'boolean', example: false, description: 'True jika semua data dalam periode berstatus cair' },
          is_legacy: { type: 'boolean', example: false },
          records: { type: 'array', items: { $ref: '#/components/schemas/OvertimeRecord' } }
        }
      },
      RekapStatusUpdateRequest: {
        type: 'object',
        required: ['start', 'end', 'status'],
        properties: {
          start: { type: 'string', format: 'date', example: '2025-10-14' },
          end: { type: 'string', format: 'date', example: '2025-10-20' },
          status: { type: 'string', enum: ['belum', 'cair', 'cair_mismatch'], example: 'cair' },
          realAmount: { type: 'integer', description: 'Jumlah aktual yang dicairkan bila berbeda' }
        }
      },
      IncomeRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'inc_123' },
          date: { type: 'string', format: 'date', example: '2025-10-01' },
          type: { type: 'string', enum: ['gaji', 'bonus', 'lainnya'], example: 'gaji' },
          amount: { type: 'integer', example: 5000000 },
          note: { type: 'string', example: 'Gaji Bulanan Oktober', nullable: true }
        }
      },
      IncomeCreateRequest: {
        type: 'object',
        required: ['amount', 'type', 'date'],
        properties: {
          date: { type: 'string', format: 'date', example: '2025-10-01' },
          type: { type: 'string', enum: ['gaji', 'bonus', 'lainnya'], example: 'gaji' },
          amount: { type: 'integer', example: 5000000 },
          note: { type: 'string', example: 'Bonus Project' }
        }
      },
      CashflowResponse: {
        type: 'object',
        properties: {
          incomes: { type: 'array', items: { $ref: '#/components/schemas/IncomeRecord' } },
          payouts: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                start: { type: 'string', format: 'date' }, 
                end: { type: 'string', format: 'date' }, 
                payment_date: { type: 'string', format: 'date' }, 
                total: { type: 'integer' }, 
                records: { type: 'integer', description: 'Jumlah entri lembur' } 
              } 
            } 
          },
          totalIncome: { type: 'integer', example: 5000000 },
          totalPayouts: { type: 'integer', example: 750000 },
          grandTotal: { type: 'integer', example: 5750000 }
        }
      }
    }
  }
};

export async function GET() {
  return NextResponse.json(spec);
}
