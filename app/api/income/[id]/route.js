import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteIncomeRecord } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await params;
  
  const { data: record } = await supabase
    .from('income')
    .select('user_id')
    .eq('id', id)
    .single();
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (record.user_id !== auth.user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  
  await deleteIncomeRecord(id);
  return NextResponse.json({ success: true });
}
