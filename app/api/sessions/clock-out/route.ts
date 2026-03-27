import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum açılmamış' }, { status: 401 });
  }

  // Açık oturumu bul
  const { data: session } = await supabase
    .from('work_sessions')
    .select('id, clock_in')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Açık oturum bulunamadı' }, { status: 404 });
  }

  const clockOut = new Date().toISOString();

  const { data, error } = await supabase
    .from('work_sessions')
    .update({ clock_out: clockOut })
    .eq('id', session.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // daily_summaries güncelle (upsert)
  const workDate = new Date(session.clock_in).toISOString().split('T')[0];
  const durationMinutes = data.duration_minutes ?? 0;

  await supabase
    .from('daily_summaries')
    .upsert(
      { user_id: user.id, work_date: workDate, total_minutes: durationMinutes, session_count: 1 },
      { onConflict: 'user_id,work_date', ignoreDuplicates: false }
    );

  return NextResponse.json({ session: data });
}
