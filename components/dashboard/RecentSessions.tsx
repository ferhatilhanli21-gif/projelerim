'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkSession } from '@/types';
import { formatDate, formatTime, formatDuration } from '@/lib/duration';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function RecentSessions({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions/history?days=7')
      .then((r) => r.json())
      .then((d) => {
        setSessions(d.sessions ?? []);
        setLoading(false);
      });
  }, [userId]);

  const weekTotal = sessions.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Son 7 Gün</CardTitle>
          <span className="text-sm text-gray-500">
            Hafta toplamı:{' '}
            <span className="font-semibold text-gray-800 font-mono">
              {formatDuration(weekTotal)}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Henüz kayıt yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left pb-2 font-medium">Tarih</th>
                  <th className="text-left pb-2 font-medium">Giriş</th>
                  <th className="text-left pb-2 font-medium">Çıkış</th>
                  <th className="text-right pb-2 font-medium">Süre</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2.5">{formatDate(s.clock_in)}</td>
                    <td className="py-2.5 font-mono">{formatTime(s.clock_in)}</td>
                    <td className="py-2.5 font-mono">
                      {s.clock_out ? formatTime(s.clock_out) : '—'}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold">
                      {formatDuration(s.duration_minutes ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
