import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { fullName, username, password, role } = await request.json();

  if (!fullName || !username || !password) {
    return NextResponse.json({ error: 'Tüm alanlar gerekli' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Supabase Auth'ta kullanıcı oluştur
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: `${username}@sorajans.local`,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // profiles tablosuna ekle
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      username,
      role: role ?? 'employee',
    });

  if (profileError) {
    // Auth kullanıcısını temizle
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
