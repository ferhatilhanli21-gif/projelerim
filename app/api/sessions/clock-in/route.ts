import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum açılmamış' }, { status: 401 });
  }

  // Açık oturum var mı kontrol et
  const { data: existing } = await supabase
    .from('work_sessions')
    .select('id')
    .eq('user_id', user.id)
    .is('clock_out', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Zaten açık bir oturumunuz var' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('work_sessions')
    .insert({ user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}
