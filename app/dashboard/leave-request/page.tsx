'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeaveRequest } from '@/types';

const TYPE_LABELS = { leave: '🏖️ İzin', late: '⏰ Geç Kalma', early: '🚪 Erken Çıkış' };
const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Bekliyor', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Onaylandı', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-600' },
};

export default function LeaveRequestPage() {
  const [type, setType] = useState<string>('late');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/leave-requests').then(r => r.json()).then(d => setRequests(d.requests ?? []));
  }, []);

  async function handleSubmit() {
    if (!reason.trim()) { toast.error('Açıklama gerekli'); return; }
    setSending(true);
    const res = await fetch('/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, reason, request_date: date }),
    });
    if (res.ok) {
      toast.success('Bildiriminiz gönderildi');
      setReason('');
      fetch('/api/leave-requests').then(r => r.json()).then(d => setRequests(d.requests ?? []));
    } else {
      toast.error('Gönderilemedi');
    }
    setSending(false);
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-xl font-bold text-gray-800">📋 İzin / Geç Kalma Bildirimi</h1>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Yeni Bildirim</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tür</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? 'late')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="late">⏰ Geç Kalma</SelectItem>
                <SelectItem value="leave">🏖️ İzin</SelectItem>
                <SelectItem value="early">🚪 Erken Çıkış</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tarih</Label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div className="space-y-1.5">
            <Label>Açıklama</Label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Sebebini kısaca açıkla..." rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
          </div>
          <Button onClick={handleSubmit} disabled={sending} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {sending ? 'Gönderiliyor...' : 'Bildir'}
          </Button>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Geçmiş Bildirimlerim</h2>
          {requests.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{TYPE_LABELS[r.type]} — {new Date(r.request_date).toLocaleDateString('tr-TR')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>
                  {r.admin_note && <p className="text-xs text-blue-600 mt-0.5">Admin notu: {r.admin_note}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[r.status].cls}`}>
                  {STATUS_LABELS[r.status].label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
