import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
  }

  const supabase = await createClient();

  // username → email dönüşümü
  const email = `${username}@sorajans.local`;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
  }

  // Kullanıcı rolünü al
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, username')
    .eq('id', data.user.id)
    .single();

  return NextResponse.json({ role: profile?.role, user: profile });
}
