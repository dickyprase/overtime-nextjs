import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { findUserById, saveUser } from '@/lib/db';

export async function PUT(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const user = await findUserById(auth.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const { salary, mealAllowance, name, telegram_id, phone } = await request.json();
  if (salary !== undefined) user.salary = parseInt(salary);
  if (mealAllowance !== undefined) user.mealAllowance = parseInt(mealAllowance);
  if (name) user.name = name;
  if (telegram_id !== undefined) user.telegram_id = telegram_id || null;
  if (phone !== undefined) user.phone = phone || null;
  await saveUser(user);
  return NextResponse.json({
    success: true,
    user: {
      id: user.id, username: user.username, name: user.name,
      role: user.role, salary: user.salary, mealAllowance: user.mealAllowance,
      telegram_id: user.telegram_id, phone: user.phone
    }
  });
}
