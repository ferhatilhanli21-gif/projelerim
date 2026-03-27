import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let query = supabase
    .from('leave_requests')
    .select('*, profiles(full_name, username)')
    .order('created_at', { ascending: false });

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { type, reason, request_date } = await request.json();

  const { data, error } = await supabase
    .from('leave_requests')
    .insert({ user_id: user.id, type, reason, request_date: request_date ?? new Date().toISOString().split('T')[0] })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Admin'lere bildirim
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  const { data: sender } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  if (admins && admins.length > 0) {
    const adminClient = createAdminClient();
    const typeLabel = { leave: 'izin', late: 'geç kalma', early: 'erken çıkış' }[type as string] ?? type;
    await adminClient.from('notifications').insert(
      admins.map((a) => ({
        user_id: a.id,
        type: 'leave_request',
        ref_id: data.id,
        body: `${sender?.full_name} ${typeLabel} bildirimi gönderdi`,
      }))
    );
  }

  return NextResponse.json({ request: data });
}
