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
    return NextResponse.json({ error: 'Başlangıç ve bitiş tarihi gerekli' }, { status: 400 });
  }

  let query = supabase
    .from('work_sessions')
    .select('user_id, duration_minutes, clock_in, profiles(full_name)')
    .gte('clock_in', `${start}T00:00:00`)
    .lte('clock_in', `${end}T23:59:59`)
    .not('clock_out', 'is', null);

  if (employeeId) {
    query = query.eq('user_id', employeeId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Çalışan bazında grupla
  const grouped: Record<string, { full_name: string; total_minutes: number; days: Set<string> }> = {};

  for (const s of data ?? []) {
    if (!grouped[s.user_id]) {
      const profile = s.profiles as unknown as { full_name: string } | null;
      grouped[s.user_id] = {
        full_name: profile?.full_name ?? 'Bilinmiyor',
        total_minutes: 0,
        days: new Set(),
      };
    }
    grouped[s.user_id].total_minutes += s.duration_minutes ?? 0;
    grouped[s.user_id].days.add(s.clock_in.split('T')[0]);
  }

  const rows = Object.entries(grouped).map(([user_id, d]) => ({
    user_id,
    full_name: d.full_name,
    total_minutes: d.total_minutes,
    day_count: d.days.size,
    avg_daily_minutes: d.days.size > 0 ? Math.round(d.total_minutes / d.days.size) : 0,
  }));

  return NextResponse.json({ rows });
}
