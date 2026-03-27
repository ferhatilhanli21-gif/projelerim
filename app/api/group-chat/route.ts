import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '50');

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(full_name, username, avatar_url, role)')
    .is('receiver_id', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { body, file_url, file_name, file_type } = await request.json();

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id: null, body, file_url, file_name, file_type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
