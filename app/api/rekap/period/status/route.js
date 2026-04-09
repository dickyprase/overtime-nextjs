import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { loadOvertimeByUserId, findUserById, insertOvertimeRecord } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getDayName, calculatePaymentDate } from '@/lib/overtime-calc';
import { getConfig } from '@/lib/config';

export async function PUT(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { start, end, status, realAmount } = await request.json();
  const userId = auth.user.id;
  const user = await findUserById(userId);
  const config = await getConfig();
  const mealAllowance = user?.mealAllowance || config.defaultMealAllowance || 30000;

  const today = new Date().toISOString().split('T')[0];
  const allDates = [];
  let currentDate = new Date(start);
  const endDate = new Date(end);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get existing records for this period
  const existingRecords = await loadOvertimeByUserId(userId);
  const periodRecords = existingRecords.filter(o => o.period_start === start && o.period_end === end);
  const existingDates = new Set(periodRecords.map(r => r.date));

  let newEntriesCount = 0;
  for (const dateStr of allDates) {
    if (existingDates.has(dateStr)) continue;
    if (dateStr > today) continue;
    const dayIdx = new Date(dateStr).getDay();
    const isWeekend = dayIdx === 0 || dayIdx === 6;
    if (!isWeekend) {
      const dayName = getDayName(dateStr);
      await insertOvertimeRecord({
        id: Date.now().toString() + '_' + dateStr, user_id: userId,
        date: dateStr, day: dayName, hours: 0, amount: mealAllowance,
        isHoliday: false, status: 'belum',
        period_start: start, period_end: end,
        payment_date: calculatePaymentDate(start), autoDetected: true,
        created_at: new Date().toISOString()
      });
      newEntriesCount++;
    }
  }

  // Update status for all records in this period
  let updateFields = {};
  if (status === 'cair_mismatch') {
    updateFields = { status: 'cair', cair_mismatch: true, real_amount: realAmount || 0 };
  } else if (status === 'cair') {
    updateFields = { status: 'cair', cair_mismatch: false, real_amount: null };
  } else {
    updateFields = { status, cair_mismatch: false, real_amount: null };
  }

  const { count } = await supabase
    .from('overtime')
    .update(updateFields)
    .eq('user_id', userId)
    .eq('period_start', start)
    .eq('period_end', end);

  return NextResponse.json({ success: true, updated: count || 0, newEntries: newEntriesCount });
}
