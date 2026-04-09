import { NextResponse } from 'next/server';
import { loadUsers, findUserByUsername } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request) {
  const { username, password } = await request.json();
  const user = await findUserByUsername(username);
  if (user && user.password === password) {
    const sessionUser = {
      id: user.id, username: user.username, name: user.name,
      role: user.role, salary: user.salary, mealAllowance: user.mealAllowance,
      telegram_id: user.telegram_id, phone: user.phone
    };
    await createSession(user);
    return NextResponse.json({ success: true, user: sessionUser });
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
