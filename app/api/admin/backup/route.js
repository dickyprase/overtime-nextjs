import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { loadUsers, loadOvertime, loadIncome } from '@/lib/db';
import { getConfig } from '@/lib/config';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const config = await getConfig();
  const backup = {
    backup_date: new Date().toISOString(),
    users: await loadUsers(),
    overtime: await loadOvertime(),
    income: await loadIncome(),
    config
  };

  const filename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
  return new NextResponse(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
