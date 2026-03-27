import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  const date = request.nextUrl.searchParams.get('date');
  const userId = request.nextUrl.searchParams.get('user');

  let query = supabase
    .from('daily_notes')
    .select('*, profiles(full_name)')
    .order('work_date', { ascending: false });

  if (profile?.role === 'admin') {
    if (userId) query = query.eq('user_id', userId);
  } else {
    query = query.eq('user_id', user.id);
  }

  if (date) query = query.eq('work_date', date);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { body, work_date } = await request.json();
  const date = work_date ?? new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_notes')
    .upsert({ user_id: user.id, work_date: date, body }, { onConflict: 'user_id,work_date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
