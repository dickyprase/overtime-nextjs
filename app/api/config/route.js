import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getConfig } from '@/lib/config';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const config = await getConfig();
  return NextResponse.json({
    companyName: config.companyName,
    defaultSalary: config.defaultSalary,
    defaultMealAllowance: config.defaultMealAllowance
  });
}
