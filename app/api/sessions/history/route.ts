import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum açılmamış' }, { status: 401 });
  }

  const days = parseInt(request.nextUrl.searchParams.get('days') ?? '7');
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('clock_in', since.toISOString())
    .not('clock_out', 'is', null)
    .order('clock_in', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
