'use client';

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry, LeaderboardPeriod } from '@/types';

export function useLeaderboard(period: LeaderboardPeriod) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const res = await window.fetch(`/api/leaderboard?period=${period}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadEntries();
    // Her 30 saniyede yenile (aktif oturumlar için)
    const interval = setInterval(loadEntries, 30_000);
    return () => clearInterval(interval);
  }, [loadEntries]);

  return { entries, loading };
}
