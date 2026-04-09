import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { findUserById, updateOvertimeFields, deleteOvertimeRecord } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { calculateOvertime, getDayName } from '@/lib/overtime-calc';

export async function PUT(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  
  // Fetch single record
  const { data: record, error: fetchErr } = await supabase
    .from('overtime')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr || !record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  if (record.user_id !== auth.user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const user = await findUserById(auth.user.id);
  const { hours, isHoliday, endTime, status } = await request.json();

  const updated = { ...record };
  if (hours !== undefined) updated.hours = parseFloat(hours);
  if (isHoliday !== undefined) updated.isHoliday = isHoliday;
  if (endTime !== undefined) updated.endTime = endTime;
  if (status !== undefined) updated.status = status;

  const dayName = getDayName(updated.date);
  updated.amount = calculateOvertime(user.salary, user.mealAllowance, dayName, updated.hours, updated.isHoliday);
  updated.updated_at = new Date().toISOString();

  await updateOvertimeFields(id, {
    hours: updated.hours, isHoliday: updated.isHoliday, endTime: updated.endTime,
    status: updated.status, amount: updated.amount, day: dayName, updated_at: updated.updated_at
  });
  return NextResponse.json({ success: true, record: updated });
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  
  const { data: record } = await supabase
    .from('overtime')
    .select('user_id')
    .eq('id', id)
    .single();
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (record.user_id !== auth.user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  
  await deleteOvertimeRecord(id);
  return NextResponse.json({ success: true });
}
