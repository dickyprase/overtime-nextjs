-- =====================================================
-- Supabase SQL Schema for Overtime Management System
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Tabel Users
create table if not exists users (
  id text primary key,
  username text unique not null,
  password text not null,
  name text not null,
  role text default 'user' check (role in ('user', 'admin')),
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

-- 5. Index untuk performa query
create index if not exists idx_overtime_user_id on overtime(user_id);
create index if not exists idx_overtime_date on overtime(date);
create index if not exists idx_overtime_period on overtime(period_start, period_end);
create index if not exists idx_income_user_id on income(user_id);
create index if not exists idx_users_username on users(username);

-- 6. Insert default admin user (password: admin123)
insert into users (id, username, password, name, role, salary, "mealAllowance")
values ('1', 'admin', 'admin123', 'Administrator', 'admin', 0, 0)
on conflict (id) do nothing;

-- 7. Insert default config
insert into config (id, settings)
values ('main', '{"companyName": "Company", "defaultSalary": 5000000, "defaultMealAllowance": 25000}')
on conflict (id) do nothing;
