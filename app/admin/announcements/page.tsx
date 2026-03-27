'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Announcement } from '@/types';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/announcements').then(r => r.json()).then(d => setAnnouncements(d.announcements ?? []));
  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, is_pinned: isPinned }),
    });
    if (res.ok) {
      toast.success('Duyuru yayınlandı');
      setShowForm(false); setTitle(''); setBody('');
      load();
    } else toast.error('Yayınlanamadı');
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    toast.success('Duyuru silindi');
    load();
  }

  async function togglePin(a: Announcement) {
    await fetch(`/api/announcements/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !a.is_pinned }),
    });
    load();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">📢 Duyuru Yönetimi</h1>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-1" /> Yeni Duyuru
        </Button>
      </div>

      {announcements.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">Henüz duyuru yok.</p>
      ) : announcements.map(a => (
        <Card key={a.id} className={a.is_pinned ? 'border-red-200' : ''}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {a.is_pinned && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">📌 Sabitlendi</span>}
                <h3 className="font-semibold text-gray-800 mt-1">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.body}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(a.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => togglePin(a)} title={a.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}>
                  <Pin className={`h-4 w-4 ${a.is_pinned ? 'text-red-500' : 'text-gray-400'}`} />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Duyuru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Başlık</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Duyuru başlığı" />
            </div>
            <div className="space-y-1.5">
              <Label>İçerik</Label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Duyuru içeriği..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="rounded" />
              Sabitle (üstte göster)
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="bg-red-600 hover:bg-red-700 text-white">
              {saving ? 'Yayınlanıyor...' : 'Yayınla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
