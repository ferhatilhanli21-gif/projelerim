import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ session: null });
  }

  const { data } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ session: data ?? null });
}
