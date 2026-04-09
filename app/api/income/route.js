import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadIncomeByUserId, insertIncomeRecord } from '@/lib/db';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const income = await loadIncomeByUserId(auth.user.id);
  return NextResponse.json(income);
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { date, type, amount, note } = await request.json();
  const record = {
    id: Date.now().toString(),
    user_id: auth.user.id,
    user_name: auth.user.name,
    date: date || new Date().toISOString().split('T')[0],
    type: type || 'lainnya',
    amount: parseInt(amount),
    note: note || '',
    created_at: new Date().toISOString()
  };
  const saved = await insertIncomeRecord(record);
  return NextResponse.json({ success: true, record: saved || record });
}
