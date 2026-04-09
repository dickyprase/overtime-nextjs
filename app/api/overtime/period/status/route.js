import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function PUT(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { start, end, status } = await request.json();
  
  const { error } = await supabase
    .from('overtime')
    .update({ status })
    .eq('user_id', auth.user.id)
    .gte('date', start)
    .lte('date', end);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
