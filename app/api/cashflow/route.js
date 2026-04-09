import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadIncomeByUserId, loadOvertimeByUserId } from '@/lib/db';

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const userId = auth.user.id;

  const income = await loadIncomeByUserId(userId);
  const overtime = await loadOvertimeByUserId(userId);

  let filteredIncome = income, filteredOvertime = overtime;
  if (month && year) {
    const m = parseInt(month), y = parseInt(year);
    filteredIncome = income.filter(i => { const d = new Date(i.date); return d.getMonth() + 1 === m && d.getFullYear() === y; });
    filteredOvertime = overtime.filter(o => { const d = new Date(o.date); return d.getMonth() + 1 === m && d.getFullYear() === y; });
  }

  const paidOvertime = filteredOvertime.filter(o => o.status === 'cair');
  const totalIncome = filteredIncome.reduce((s, i) => s + i.amount, 0);
  const totalOvertime = paidOvertime.reduce((s, o) => s + (o.amount || 0), 0);

  return NextResponse.json({
    income: filteredIncome, overtime: paidOvertime,
    summary: { total_income: totalIncome, total_overtime: totalOvertime, grand_total: totalIncome + totalOvertime }
  });
}
