import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const results = [];

  try {
    // ===================== TABEL USERS =====================
    const { error: checkUsers } = await supabase.from('users').select('id').limit(1);
    if (checkUsers && checkUsers.code === 'PGRST205') {
      // Tabel belum ada — kita tidak bisa CREATE TABLE via PostgREST.
      // Jadi kita minta Supabase buat lewat Management API atau manual SQL.
      return NextResponse.json({
        success: false,
        error: 'Tabel belum dibuat. Supabase PostgREST tidak mendukung CREATE TABLE.',
        instructions: [
          '1. Buka dashboard Supabase: https://supabase.com/dashboard',
          '2. Pilih project Anda',
          '3. Klik menu "SQL Editor" di sidebar kiri (ikon database)',
          '4. Klik tombol "+ New Query"',
          '5. Copy-paste SQL di bawah ini, lalu klik "Run"'
        ],
        sql: getSchemaSQL()
      }, { status: 200 });
    }

    results.push('✅ Tabel users: OK');

    // ===================== TABEL OVERTIME =====================
    const { error: checkOvertime } = await supabase.from('overtime').select('id').limit(1);
    if (checkOvertime && checkOvertime.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: 'Tabel overtime belum ada.',
        instructions: ['Jalankan SQL schema lengkap di Supabase SQL Editor'],
        sql: getSchemaSQL()
      }, { status: 200 });
    }
    results.push('✅ Tabel overtime: OK');

    // ===================== TABEL INCOME =====================
    const { error: checkIncome } = await supabase.from('income').select('id').limit(1);
    if (checkIncome && checkIncome.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: 'Tabel income belum ada.',
        instructions: ['Jalankan SQL schema lengkap di Supabase SQL Editor'],
        sql: getSchemaSQL()
      }, { status: 200 });
    }
    results.push('✅ Tabel income: OK');

    // ===================== TABEL CONFIG =====================
    const { error: checkConfig } = await supabase.from('config').select('id').limit(1);
    if (checkConfig && checkConfig.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: 'Tabel config belum ada.',
        instructions: ['Jalankan SQL schema lengkap di Supabase SQL Editor'],
        sql: getSchemaSQL()
      }, { status: 200 });
    }
    results.push('✅ Tabel config: OK');

    // ====== Cek default admin ======
    const { data: adminCheck } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!adminCheck) {
      await supabase.from('users').insert({
        id: '1', username: 'admin', password: 'admin123',
        name: 'Administrator', role: 'admin', salary: 0, mealAllowance: 0
      });
      results.push('👤 Default admin dibuat (admin / admin123)');
    } else {
      results.push('✅ Admin user: OK');
    }

    // ====== Cek default config ======
    const { data: configCheck } = await supabase
      .from('config')
      .select('id')
      .eq('id', 'main')
      .single();

    if (!configCheck) {
      await supabase.from('config').insert({
        id: 'main',
        settings: { companyName: 'Company', defaultSalary: 5000000, defaultMealAllowance: 25000 }
      });
      results.push('⚙️ Default config dibuat');
    } else {
      results.push('✅ Config: OK');
    }

    return NextResponse.json({
      success: true,
      message: 'Semua tabel sudah siap!',
      results
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      instructions: ['Jalankan SQL schema secara manual di Supabase SQL Editor'],
      sql: getSchemaSQL()
    }, { status: 500 });
  }
}

function getSchemaSQL() {
  return `
-- =====================================================
-- Supabase SQL Schema for Overtime Management System
-- Copy-paste SEMUA baris ini di Supabase SQL Editor
-- =====================================================

-- 1. Tabel Users
create table if not exists users (
  id text primary key,
  username text unique not null,
  password text not null,
  name text not null,
  role text default 'user',
  salary integer default 5000000,
  "mealAllowance" integer default 25000,
  telegram_id text,
  phone text,
  created_at timestamptz default now()
);

-- 2. Tabel Overtime
create table if not exists overtime (
  id text primary key,
  user_id text references users(id) on delete cascade,
  user_name text,
  date text,
  day text,
  hours numeric default 0,
  "endTime" text,
  "isHoliday" boolean default false,
  amount integer default 0,
  period_start text,
  period_end text,
  payment_date text,
  status text default 'belum',
  cair_mismatch boolean default false,
  real_amount integer,
  "autoDetected" boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- 3. Tabel Income
create table if not exists income (
  id text primary key,
  user_id text references users(id) on delete cascade,
  user_name text,
  date text,
  type text default 'lainnya',
  amount integer default 0,
  note text,
  created_at timestamptz default now()
);

-- 4. Tabel Config
create table if not exists config (
  id text primary key default 'main',
  settings jsonb default '{}',
  updated_at timestamptz default now()
);

-- 5. Indexes
create index if not exists idx_overtime_user_id on overtime(user_id);
create index if not exists idx_overtime_date on overtime(date);
create index if not exists idx_overtime_period on overtime(period_start, period_end);
create index if not exists idx_income_user_id on income(user_id);
create index if not exists idx_users_username on users(username);

-- 6. Default admin user (password: admin123)
insert into users (id, username, password, name, role, salary, "mealAllowance")
values ('1', 'admin', 'admin123', 'Administrator', 'admin', 0, 0)
on conflict (id) do nothing;

-- 7. Default config
insert into config (id, settings)
values ('main', '{"companyName": "Company", "defaultSalary": 5000000, "defaultMealAllowance": 25000}')
on conflict (id) do nothing;
  `.trim();
}
