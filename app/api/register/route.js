import { NextResponse } from 'next/server';
import { findUserByUsername, saveUser } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { getConfig } from '@/lib/config';
import { sanitizeString, validateUsername, validatePassword } from '@/lib/overtime-calc';

export async function POST(request) {
  const body = await request.json();
  const config = await getConfig();

  const username = sanitizeString(body.username, 50);
  const password = body.password;
  const name = sanitizeString(body.name, 100);

  if (!username || !password || !name) return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
  if (!validateUsername(username)) return NextResponse.json({ error: 'Username hanya boleh huruf, angka, underscore, dan dash (3-50 karakter)' }, { status: 400 });
  if (!validatePassword(password)) return NextResponse.json({ error: 'Password minimal 3 karakter, maksimal 100 karakter' }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: 'Nama minimal 2 karakter' }, { status: 400 });

  const existing = await findUserByUsername(username);
  if (existing) return NextResponse.json({ error: 'Username sudah dipakai' }, { status: 400 });

  const newUser = {
    id: Date.now().toString(),
    username, password, name,
    role: 'user',
    telegram_id: null,
    salary: config.defaultSalary || 5000000,
    mealAllowance: config.defaultMealAllowance || 25000,
    created_at: new Date().toISOString()
  };
  await saveUser(newUser);

  await createSession(newUser);
  const sessionUser = { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role, salary: newUser.salary, mealAllowance: newUser.mealAllowance, telegram_id: newUser.telegram_id };
  return NextResponse.json({ success: true, user: sessionUser });
}
