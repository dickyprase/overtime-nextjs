import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { loadUsers, saveUser, findUserByUsername } from '@/lib/db';
import { getConfig } from '@/lib/config';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const users = await loadUsers();
  return NextResponse.json(users.map(u => ({
    id: u.id, username: u.username, name: u.name, role: u.role,
    telegram_id: u.telegram_id, phone: u.phone, salary: u.salary, mealAllowance: u.mealAllowance
  })));
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const config = await getConfig();
  const { username, password, name, role, telegram_id, phone } = await request.json();
  
  const existing = await findUserByUsername(username);
  if (existing) return NextResponse.json({ error: 'Username exists' }, { status: 400 });
  
  const newUser = {
    id: Date.now().toString(), username, password, name,
    role: role || 'user', telegram_id: telegram_id || null, phone: phone || null,
    salary: config.defaultSalary || 5000000, mealAllowance: config.defaultMealAllowance || 25000,
    created_at: new Date().toISOString()
  };
  await saveUser(newUser);
  return NextResponse.json({ success: true, user: { ...newUser, password: undefined } });
}
