import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, role')
    .eq('is_active', true)
    .order('full_name');

  return NextResponse.json({ users: profiles ?? [] });
}
