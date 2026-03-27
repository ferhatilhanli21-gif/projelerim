'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyNote } from '@/types';
import { formatDate } from '@/lib/duration';

function todayStr() { return new Date().toISOString().split('T')[0]; }

export default function NotesPage() {
  const [body, setBody] = useState('');
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/daily-notes').then(r => r.json()).then(d => {
      setNotes(d.notes ?? []);
      const todayNote = d.notes?.find((n: DailyNote) => n.work_date === todayStr());
      if (todayNote) setBody(todayNote.body);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/daily-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, work_date: date }),
    });
    if (res.ok) {
      toast.success('Not kaydedildi');
      fetch('/api/daily-notes').then(r => r.json()).then(d => setNotes(d.notes ?? []));
    } else {
      toast.error('Kaydedilemedi');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">📝 Günlük Notlarım</h1>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Bugün Ne Yaptım?</CardTitle>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                const existing = notes.find(n => n.work_date === e.target.value);
                setBody(existing?.body ?? '');
              }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Bugün neler yaptığını yaz... (görevler, toplantılar, tamamlananlar)"
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 resize-none"
          />
          <Button
            onClick={handleSave}
            disabled={saving || !body.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </CardContent>
      </Card>

      {/* Geçmiş notlar */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Geçmiş Notlar</h2>
          {notes.map(n => (
            <Card key={n.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => { setDate(n.work_date); setBody(n.body); }}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">{formatDate(n.work_date)}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{n.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
