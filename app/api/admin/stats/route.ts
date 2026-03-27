import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const weekStr = monday.toISOString().split('T')[0];

  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Aktif oturum sayısı
  const { count: activeNow } = await supabase
    .from('work_sessions')
    .select('id', { count: 'exact', head: true })
    .is('clock_out', null);

  // Bugün toplam dakika (tamamlanmış)
  const { data: todaySessions } = await supabase
    .from('work_sessions')
    .select('duration_minutes')
    .gte('clock_in', `${todayStr}T00:00:00`)
    .not('clock_out', 'is', null);

  // Aktif oturumların anlık süresi
  const { data: activeSessions } = await supabase
    .from('work_sessions')
    .select('clock_in')
    .is('clock_out', null);

  const nowMs = Date.now();
  const activeMinutes = (activeSessions ?? []).reduce(
    (acc, s) => acc + Math.floor((nowMs - new Date(s.clock_in).getTime()) / 60000),
    0
  );

  const todayMinutes =
    (todaySessions ?? []).reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0) + activeMinutes;

  // Bu hafta
  const { data: weekSessions } = await supabase
    .from('work_sessions')
    .select('duration_minutes')
    .gte('clock_in', `${weekStr}T00:00:00`)
    .not('clock_out', 'is', null);

  const weekMinutes = (weekSessions ?? []).reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);

  // Bu ay
  const { data: monthSessions } = await supabase
    .from('work_sessions')
    .select('duration_minutes')
    .gte('clock_in', `${monthStr}T00:00:00`)
    .not('clock_out', 'is', null);

  const monthMinutes = (monthSessions ?? []).reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);

  return NextResponse.json({
    active_now: activeNow ?? 0,
    today_total_minutes: todayMinutes,
    week_total_minutes: weekMinutes,
    month_total_minutes: monthMinutes,
  });
}
