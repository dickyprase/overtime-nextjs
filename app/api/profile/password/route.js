import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { findUserById, saveUser } from '@/lib/db';

export async function PUT(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const user = await findUserById(auth.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Password required' }, { status: 400 });
  if (user.password !== currentPassword) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
  if (newPassword.length < 3) return NextResponse.json({ error: 'Password minimal 3 karakter' }, { status: 400 });
  user.password = newPassword;
  await saveUser(user);
  return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
}
