import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadOvertimeByUserId, findUserById } from '@/lib/db';
import { calculateOvertime, getDayName, roundToThousand, calculatePaymentDate } from '@/lib/overtime-calc';

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const allOvertime = await loadOvertimeByUserId(auth.user.id);
  const inputtedData = allOvertime.filter(o => o.date >= start && o.date <= end);
  const user = await findUserById(auth.user.id);
  
  if (!user) {
    return NextResponse.json({ error: 'User tidak ditemukan di database. Silakan logout dan login kembali.' }, { status: 404 });
  }

  const allDates = [];
  let currentDate = new Date(start);
  const endDate = new Date(end);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const records = [];
  let total = 0;
  const today = new Date().toISOString().split('T')[0];

  allDates.forEach(dateStr => {
    const dayName = getDayName(dateStr);
    const dayIdx = new Date(dateStr).getDay();
    const isWeekend = dayIdx === 0 || dayIdx === 6;
    const inputted = inputtedData.find(o => o.date === dateStr);

    if (inputted) {
      const amount = calculateOvertime(user.salary, user.mealAllowance, dayName, inputted.hours, inputted.isHoliday);
      inputted.amount = amount;
      inputted.day = dayName;
      inputted.autoDetected = false;
      total += amount;
      records.push(inputted);
    } else if (!isWeekend && dateStr <= today) {
      const amount = user.mealAllowance;
      const autoRecord = {
        id: 'auto_' + dateStr, user_id: user.id, date: dateStr, day: dayName,
        hours: 0, isHoliday: false, amount, status: 'belum', autoDetected: true
      };
      total += amount;
      records.push(autoRecord);
    }
  });

  records.sort((a, b) => a.date.localeCompare(b.date));
  return NextResponse.json({
    records, period: { start, end },
    total, rounded_total: roundToThousand(total),
    payment_date: calculatePaymentDate(end)
  });
}
