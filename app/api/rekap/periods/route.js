import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadOvertimeByUserId, findUserById } from '@/lib/db';
import { getWeekPeriod, calculatePaymentDate, formatDateID, getDayName, roundToThousand } from '@/lib/overtime-calc';
import { getConfig } from '@/lib/config';

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const overtime = await loadOvertimeByUserId(auth.user.id);
  const periodsMap = {};

  overtime.forEach(o => {
    let periodStart, periodEnd;
    if (o.period_start && o.period_end) {
      periodStart = o.period_start;
      periodEnd = o.period_end;
    } else if (o.week_start) {
      const period = getWeekPeriod(o.week_start);
      periodStart = period.start;
      periodEnd = period.end;
    } else return;

    const key = `${periodStart}_${periodEnd}`;
    if (!periodsMap[key]) {
      const payDate = o.payment_date || calculatePaymentDate(periodEnd);
      periodsMap[key] = {
        start: periodStart, end: periodEnd,
        start_formatted: formatDateID(periodStart), end_formatted: formatDateID(periodEnd),
        payment_date: payDate, payment_date_formatted: formatDateID(payDate),
        records: [], total: 0, all_cair: true, is_legacy: !o.period_start
      };
    }

    if (o.days && !o.date) {
      const dayOrder = ['kamis', 'jumat', 'sabtu', 'minggu', 'senin', 'selasa', 'rabu'];
      dayOrder.forEach((dayName, idx) => {
        const dayData = o.days[dayName];
        if (dayData && dayData.hours > 0) {
          const dayDate = new Date(periodStart);
          dayDate.setDate(dayDate.getDate() + idx);
          periodsMap[key].records.push({
            id: `${o.id}_${dayName}`, date: dayDate.toISOString().split('T')[0],
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            hours: dayData.hours, amount: dayData.amount || 0,
            isHoliday: dayData.isHoliday || false,
            status: o.status === 'approved' ? 'cair' : (o.status || 'belum'), legacy: true
          });
          periodsMap[key].total += dayData.amount || 0;
          if (o.status !== 'approved' && o.status !== 'cair') periodsMap[key].all_cair = false;
        }
      });
    } else if (o.date) {
      periodsMap[key].records.push({
        id: o.id, date: o.date, day: o.day,
        hours: o.hours, amount: o.amount || 0,
        isHoliday: o.isHoliday || false, status: o.status || 'belum',
        cair_mismatch: o.cair_mismatch || false, real_amount: o.real_amount || null
      });
      periodsMap[key].total += o.amount || 0;
      if (o.status !== 'cair') periodsMap[key].all_cair = false;
      if (o.cair_mismatch) periodsMap[key].has_mismatch = true;
    }
  });

  let periods = Object.values(periodsMap).sort((a, b) => a.start.localeCompare(b.start));

  if (month && year) {
    const m = parseInt(month), y = parseInt(year);
    periods = periods.filter(p => {
      const d = new Date(p.start);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });
  }

  const user = await findUserById(auth.user.id);
  const config = await getConfig();
  const today = new Date().toISOString().split('T')[0];

  periods.forEach(p => {
    if (p.is_legacy) return;
    const allDates = [];
    let currentDate = new Date(p.start);
    const endDate = new Date(p.end);
    while (currentDate <= endDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const existingDates = new Set(p.records.map(r => r.date));
    allDates.forEach(dateStr => {
      if (existingDates.has(dateStr)) return;
      const dayIdx = new Date(dateStr).getDay();
      const isWeekend = dayIdx === 0 || dayIdx === 6;
      if (!isWeekend && dateStr <= today) {
        const dayName = getDayName(dateStr);
        const amount = user.mealAllowance || config.defaultMealAllowance || 30000;
        p.records.push({
          id: 'auto_' + dateStr, date: dateStr, day: dayName,
          hours: 0, amount, isHoliday: false, status: 'belum', autoDetected: true
        });
        p.total += amount;
      }
    });
    p.rounded_total = roundToThousand(p.total);
    p.records.sort((a, b) => a.date.localeCompare(b.date));
  });

  return NextResponse.json(periods);
}
