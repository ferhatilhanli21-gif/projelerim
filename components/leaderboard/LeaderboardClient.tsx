'use client';

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry, LeaderboardPeriod } from '@/types';
import { LeaderboardFilter } from './LeaderboardFilter';
import { TopThreeCards } from './TopThreeCards';
import { LeaderboardList } from './LeaderboardList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function LeaderboardClient() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('today');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/leaderboard?period=${period}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6">
      <LeaderboardFilter period={period} onChange={setPeriod} />

      {loading ? (
        <div className="py-16"><LoadingSpinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Henüz kayıt yok.</p>
      ) : (
        <>
          <TopThreeCards entries={top3} />
          {rest.length > 0 && <LeaderboardList entries={rest} startRank={4} />}
        </>
      )}
    </div>
  );
}
