'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardEntry } from '@/types';
import { formatDuration } from '@/lib/duration';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

export function ActiveNow() {
  const [active, setActive] = useState<LeaderboardEntry[]>([]);
  const onlineIds = useOnlineUsers();

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

  // Hem mesaidekileri hem sadece çevrimiçi olanları göster
  const onlineNotWorking = Array.from(onlineIds).filter(
    id => !active.some(e => e.user_id === id)
  );

  if (active.length === 0 && onlineIds.size === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Şu An Aktif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mesaidekileri göster */}
        {active.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Mesaide ({active.length} kişi)</p>
            <div className="flex flex-wrap gap-2">
              {active.map((e) => (
                <div key={e.user_id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                      {e.full_name.charAt(0)}
                    </div>
                    {onlineIds.has(e.user_id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.full_name}</p>
                    <p className="text-xs text-green-600 font-mono">{formatDuration(e.total_minutes)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sadece çevrimiçi olanlar (mesaiste değil) */}
        {onlineNotWorking.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Çevrimiçi ({onlineNotWorking.length} kişi)</p>
            <div className="flex flex-wrap gap-2">
              {onlineNotWorking.map((id) => (
                <div key={id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                      ?
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
                  </div>
                  <p className="text-xs text-blue-600">Giriş yapmış</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
