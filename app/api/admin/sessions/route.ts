import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const employeeId = searchParams.get('employee');

  if (!start || !end) {
    return NextResponse.json({ error: 'Tarih aralığı gerekli' }, { status: 400 });
  }

  let query = supabase
    .from('work_sessions')
    .select('id, user_id, clock_in, clock_out, duration_minutes, profiles(full_name, username)')
    .gte('clock_in', `${start}T00:00:00`)
    .lte('clock_in', `${end}T23:59:59`)
    .order('clock_in', { ascending: false });

  if (employeeId && employeeId !== 'all') {
    query = query.eq('user_id', employeeId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sessions: data });
}
