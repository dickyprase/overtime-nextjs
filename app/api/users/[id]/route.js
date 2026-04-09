import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { findUserById, saveUser, deleteUser } from '@/lib/db';

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  const user = await findUserById(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const { telegram_id, name, phone } = await request.json();
  if (telegram_id !== undefined) user.telegram_id = telegram_id;
  if (phone !== undefined) user.phone = phone;
  if (name) user.name = name;
  await saveUser(user);
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  await deleteUser(id);
  return NextResponse.json({ success: true });
}
