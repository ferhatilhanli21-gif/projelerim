'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch('/api/announcements').then(r => r.json()).then(d => setAnnouncements(d.announcements ?? []));
  }, []);

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">📢 Duyurular</h1>
      {announcements.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">Henüz duyuru yok.</p>
      ) : announcements.map(a => (
        <Card key={a.id} className={a.is_pinned ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                {a.is_pinned && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full mr-2">📌 Sabitlendi</span>}
                <h3 className="font-semibold text-gray-800 mt-1">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.body}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {a.profiles?.full_name} · {new Date(a.created_at).toLocaleDateString('tr-TR')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
