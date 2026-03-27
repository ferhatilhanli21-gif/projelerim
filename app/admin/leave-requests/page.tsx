'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeaveRequest } from '@/types';

const TYPE_LABELS: Record<string, string> = { leave: '🏖️ İzin', late: '⏰ Geç Kalma', early: '🚪 Erken Çıkış' };
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};
const STATUS_LABELS: Record<string, string> = { pending: 'Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi' };

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const load = () => fetch('/api/leave-requests').then(r => r.json()).then(d => setRequests(d.requests ?? []));
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`/api/leave-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: adminNote[id] ?? '' }),
    });
    if (res.ok) {
      toast.success(status === 'approved' ? 'Onaylandı' : 'Reddedildi');
      load();
    } else toast.error('İşlem başarısız');
  }

  const pending = requests.filter(r => r.status === 'pending');
  const done = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">📋 İzin & Bildirim Talepleri</h1>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">⏳ Bekleyenler ({pending.length})</h2>
          {pending.map(r => (
            <Card key={r.id} className="border-yellow-200">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{r.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">{TYPE_LABELS[r.type]} — {new Date(r.request_date).toLocaleDateString('tr-TR')}</p>
                    <p className="text-sm text-gray-500 mt-1">{r.reason}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Admin notu (opsiyonel)"
                  value={adminNote[r.id] ?? ''}
                  onChange={e => setAdminNote(prev => ({ ...prev, [r.id]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400"
                />
                <div className="flex gap-2">
                  <Button onClick={() => updateStatus(r.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                    ✓ Onayla
                  </Button>
                  <Button onClick={() => updateStatus(r.id, 'rejected')} variant="outline" className="border-red-200 text-red-600 flex-1">
                    ✗ Reddet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Geçmiş</h2>
          {done.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.profiles?.full_name} — {TYPE_LABELS[r.type]}</p>
                  <p className="text-xs text-gray-500">{new Date(r.request_date).toLocaleDateString('tr-TR')} · {r.reason}</p>
                  {r.admin_note && <p className="text-xs text-blue-600 mt-0.5">Not: {r.admin_note}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-12">Henüz bildirim yok.</p>
      )}
    </div>
  );
}
