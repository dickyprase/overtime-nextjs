import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const u = await findUserById(auth.user.id);
  if (u) {
    return NextResponse.json({
      id: u.id, username: u.username, name: u.name, role: u.role,
      salary: u.salary, mealAllowance: u.mealAllowance,
      telegram_id: u.telegram_id, phone: u.phone
    });
  }
  return NextResponse.json(auth.user);
}
