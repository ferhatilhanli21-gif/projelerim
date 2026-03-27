'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardEntry } from '@/types';
import { formatDuration, getLiveMinutes } from '@/lib/duration';

export function ActiveNow() {
  const [active, setActive] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/leaderboard?period=today');
      const data = await res.json();
      setActive((data.entries ?? []).filter((e: LeaderboardEntry) => e.is_active_session));
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (active.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Şu An Mesaide ({active.length} kişi)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {active.map((e) => (
            <div key={e.user_id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                {e.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{e.full_name}</p>
                <p className="text-xs text-green-600 font-mono">{formatDuration(e.total_minutes)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
