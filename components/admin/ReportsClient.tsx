'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportRow, Profile } from '@/types';
import { formatDuration, formatDate, formatTime } from '@/lib/duration';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

interface SessionRow {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  duration_minutes: number | null;
  profiles: { full_name: string; username: string } | null;
}

export function ReportsClient() {
  const [start, setStart] = useState(monthStartStr());
  const [end, setEnd] = useState(todayStr());
  const [employeeId, setEmployeeId] = useState('all');
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/employees')
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []));
  }, []);

  async function loadReport() {
    setLoading(true);
    const params = new URLSearchParams({ start, end });
    if (employeeId !== 'all') params.set('employee', employeeId);

    const [summaryRes, sessionsRes] = await Promise.all([
      fetch(`/api/admin/reports?${params}`),
      fetch(`/api/admin/sessions?${params}`),
    ]);

    const summaryData = await summaryRes.json();
    const sessionsData = await sessionsRes.json();

    setRows(summaryData.rows ?? []);
    setSessions(sessionsData.sessions ?? []);
    setLoading(false);
  }

  async function handleExport() {
    setExporting(true);
    const params = new URLSearchParams({ start, end });
    if (employeeId !== 'all') params.set('employee', employeeId);
    const res = await fetch(`/api/export/excel?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapor-${start}-${end}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.error('Excel oluşturulamadı');
    }
    setExporting(false);
  }

  const hasData = rows.length > 0 || sessions.length > 0;

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Başlangıç</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Bitiş</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Çalışan</Label>
              <Select value={employeeId} onValueChange={(v) => setEmployeeId(v ?? 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Çalışanlar</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadReport} className="bg-red-600 hover:bg-red-700 text-white">
              Raporla
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="py-8"><LoadingSpinner /></div>}

      {!loading && hasData && (
        <Tabs defaultValue="summary">
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="summary">Özet</TabsTrigger>
              <TabsTrigger value="detail">Detaylı Kayıtlar</TabsTrigger>
            </TabsList>
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Download className="h-4 w-4 mr-1" />
              {exporting ? 'Hazırlanıyor...' : "Excel'e Aktar"}
            </Button>
          </div>

          {/* ÖZET TABLO */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b">
                        <th className="text-left px-4 py-3 font-medium">Çalışan</th>
                        <th className="text-right px-4 py-3 font-medium">Toplam Saat</th>
                        <th className="text-right px-4 py-3 font-medium">Gün Sayısı</th>
                        <th className="text-right px-4 py-3 font-medium">Ort. Günlük</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.user_id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{row.full_name}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">
                            {formatDuration(row.total_minutes)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{row.day_count} gün</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-600">
                            {formatDuration(row.avg_daily_minutes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DETAYLI KAYITLAR */}
          <TabsContent value="detail">
            <Card>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <p className="text-xs text-gray-500">
                    {sessions.length} kayıt — her buton basımının tam saati
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b">
                        <th className="text-left px-4 py-3 font-medium">Çalışan</th>
                        <th className="text-left px-4 py-3 font-medium">Tarih</th>
                        <th className="text-left px-4 py-3 font-medium">Giriş Saati</th>
                        <th className="text-left px-4 py-3 font-medium">Çıkış Saati</th>
                        <th className="text-right px-4 py-3 font-medium">Süre</th>
                        <th className="text-right px-4 py-3 font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium">
                            {s.profiles?.full_name ?? '—'}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {formatDate(s.clock_in)}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-green-700 font-semibold">
                            {formatTime(s.clock_in)}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-red-600 font-semibold">
                            {s.clock_out ? formatTime(s.clock_out) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-gray-700">
                            {s.duration_minutes != null
                              ? formatDuration(s.duration_minutes)
                              : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {s.clock_out ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Tamamlandı
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full animate-pulse">
                                Devam Ediyor
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
