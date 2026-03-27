import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, formatTime, formatDate } from '@/lib/duration';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const employeeId = searchParams.get('employee');

  if (!start || !end) {
    return NextResponse.json({ error: 'Tarih aralığı gerekli' }, { status: 400 });
  }

  let query = supabase
    .from('work_sessions')
    .select('user_id, clock_in, clock_out, duration_minutes, profiles(full_name)')
    .gte('clock_in', `${start}T00:00:00`)
    .lte('clock_in', `${end}T23:59:59`)
    .not('clock_out', 'is', null)
    .order('clock_in');

  if (employeeId) {
    query = query.eq('user_id', employeeId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((s) => {
    const profile = s.profiles as unknown as { full_name: string } | null;
    return {
      'Çalışan Adı': profile?.full_name ?? '',
      'Tarih': formatDate(s.clock_in),
      'Giriş Saati': formatTime(s.clock_in),
      'Çıkış Saati': s.clock_out ? formatTime(s.clock_out) : '',
      'Süre': formatDuration(s.duration_minutes ?? 0),
      'Toplam Saat': parseFloat(((s.duration_minutes ?? 0) / 60).toFixed(2)),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Çalışma Raporu');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rapor-${start}-${end}.xlsx"`,
    },
  });
}
