import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadOvertimeByUserId, insertOvertimeRecord, findUserById } from '@/lib/db';
import { calculateOvertime, getDayName, getWeekPeriod, calculatePaymentDate } from '@/lib/overtime-calc';

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const overtime = await loadOvertimeByUserId(auth.user.id);
  return NextResponse.json(overtime);
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json({ error: 'Format JSON tidak valid' }, { status: 400 });
    }

    const { date, hours, isHoliday, endTime } = body;

    if (!date || typeof hours === 'undefined') {
      return NextResponse.json({ error: 'date dan hours wajib diisi' }, { status: 400 });
    }

    const user = await findUserById(auth.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

    // Check duplicate
    const existing = await loadOvertimeByUserId(user.id);
    if (existing.find(o => o.date === date)) {
      return NextResponse.json({ error: 'Sudah ada data untuk tanggal ini. Gunakan edit untuk mengubah.' }, { status: 400 });
    }

    const dayName = getDayName(date);
    if (!dayName) {
      return NextResponse.json({ error: 'Format tanggal (date) tidak valid' }, { status: 400 });
    }

    const period = getWeekPeriod(date);
    const amount = calculateOvertime(user.salary, user.mealAllowance, dayName, parseFloat(hours), isHoliday);

    const record = {
      id: Date.now().toString(),
      user_id: user.id,
      user_name: user.name,
      date,
      day: dayName,
      hours: parseFloat(hours),
      endTime: endTime || null,
      isHoliday: isHoliday || false,
      amount,
      period_start: period.start,
      period_end: period.end,
      payment_date: calculatePaymentDate(period.end),
      status: 'belum',
      created_at: new Date().toISOString()
    };

    const saved = await insertOvertimeRecord(record);
    return NextResponse.json({ success: true, record: saved || record });

  } catch (error) {
    console.error("POST /api/overtime ERROR:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem: ' + error.message }, { status: 500 });
  }
}
