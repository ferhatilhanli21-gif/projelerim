import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) ?? 'group';

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });

  const ext = file.name.split('.').pop();
  const path = `${folder}/${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-files')
    .upload(path, file, { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path);

  const fileType = file.type.startsWith('image/') ? 'image' : 'document';

  return NextResponse.json({
    url: urlData.publicUrl,
    name: file.name,
    type: fileType,
  });
}
