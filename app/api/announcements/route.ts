import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*, profiles!announcements_author_id_fkey(full_name)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { title, body, is_pinned } = await request.json();

  const { data, error } = await supabase
    .from('announcements')
    .insert({ author_id: user.id, title, body, is_pinned: is_pinned ?? true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tüm çalışanlara bildirim gönder
  const { data: profiles } = await supabase.from('profiles').select('id').eq('is_active', true).neq('id', user.id);
  if (profiles && profiles.length > 0) {
    const adminClient = createAdminClient();
    await adminClient.from('notifications').insert(
      profiles.map((p) => ({
        user_id: p.id,
        type: 'announcement',
        ref_id: data.id,
        body: `Yeni duyuru: ${title}`,
      }))
    );
  }

  return NextResponse.json({ announcement: data });
}
