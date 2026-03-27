import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeaderboardPeriod, LeaderboardEntry } from '@/types';

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get('period') ?? 'today') as LeaderboardPeriod;
  const supabase = await createClient();

  let dateFilter: string;
  const now = new Date();

  if (period === 'today') {
    dateFilter = now.toISOString().split('T')[0];
  } else if (period === 'week') {
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    dateFilter = monday.toISOString().split('T')[0];
  } else {
    dateFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  // Tamamlanmış oturumları topla
  const { data: sessions } = await supabase
    .from('work_sessions')
    .select('user_id, duration_minutes, clock_in, clock_out')
    .gte('clock_in', `${dateFilter}T00:00:00`)
    .not('clock_out', 'is', null);

  // Aktif oturumları al
  const { data: activeSessions } = await supabase
    .from('work_sessions')
    .select('user_id, clock_in')
    .gte('clock_in', `${dateFilter}T00:00:00`)
    .is('clock_out', null);

  // Profilleri al
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .eq('is_active', true);

  if (!profiles) {
    return NextResponse.json({ entries: [] });
  }

  const nowMs = Date.now();
  const minuteMap: Record<string, number> = {};
  const activeSet = new Set<string>();

  for (const s of sessions ?? []) {
    minuteMap[s.user_id] = (minuteMap[s.user_id] ?? 0) + (s.duration_minutes ?? 0);
  }

  for (const a of activeSessions ?? []) {
    activeSet.add(a.user_id);
    const liveMinutes = Math.floor((nowMs - new Date(a.clock_in).getTime()) / 60000);
    minuteMap[a.user_id] = (minuteMap[a.user_id] ?? 0) + liveMinutes;
  }

  const entries: LeaderboardEntry[] = profiles
    .map((p) => ({
      user_id: p.id,
      full_name: p.full_name,
      username: p.username,
      avatar_url: p.avatar_url,
      total_minutes: minuteMap[p.id] ?? 0,
      is_active_session: activeSet.has(p.id),
    }))
    .sort((a, b) => b.total_minutes - a.total_minutes);

  return NextResponse.json({ entries });
}
