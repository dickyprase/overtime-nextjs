import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { loadOvertime } from '@/lib/db';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const overtime = await loadOvertime();
  return NextResponse.json(overtime);
}
