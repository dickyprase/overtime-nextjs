import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { findUserById, saveUser } from '@/lib/db';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  const user = await findUserById(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  user.password = '123';
  await saveUser(user);
  return NextResponse.json({ success: true, message: 'Password reset to 123' });
}
