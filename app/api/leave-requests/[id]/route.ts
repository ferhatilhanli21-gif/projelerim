import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { status, admin_note } = await request.json();

  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status, admin_note })
    .eq('id', id)
    .select('user_id, type')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Çalışana bildirim
  const statusLabel = { approved: 'onaylandı', rejected: 'reddedildi' }[status as string] ?? status;
  const typeLabel = { leave: 'İzin', late: 'Geç kalma', early: 'Erken çıkış' }[data.type as string] ?? data.type;

  const adminClient = createAdminClient();
  await adminClient.from('notifications').insert({
    user_id: data.user_id,
    type: 'leave_update',
    ref_id: id,
    body: `${typeLabel} talebiniz ${statusLabel}`,
  });

  return NextResponse.json({ success: true });
}
