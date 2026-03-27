import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const otherId = request.nextUrl.searchParams.get('with');

  if (!otherId) {
    // Konuşma listesi: her kişiyle son mesaj
    const { data } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, username, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .not('receiver_id', 'is', null)
      .order('created_at', { ascending: false });

    return NextResponse.json({ messages: data ?? [] });
  }

  // Belirli kişiyle mesajlar
  const { data } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(full_name, username, avatar_url)')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  // Okunmamışları işaretle
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { receiver_id, body, file_url, file_name, file_type } = await request.json();

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id: receiver_id ?? null, body, file_url, file_name, file_type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Bildirim oluştur (DM ise)
  if (receiver_id) {
    const { data: sender } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const adminClient = createAdminClient();
    await adminClient.from('notifications').insert({
      user_id: receiver_id,
      type: 'message',
      ref_id: data.id,
      body: `${sender?.full_name} sana mesaj gönderdi`,
    });
  }

  return NextResponse.json({ message: data });
}
