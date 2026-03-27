'use client';

import { LeaderboardPeriod } from '@/types';

const FILTERS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'today', label: 'Bugün' },
  { value: 'week', label: 'Bu Hafta' },
  { value: 'month', label: 'Bu Ay' },
];

interface LeaderboardFilterProps {
  period: LeaderboardPeriod;
  onChange: (p: LeaderboardPeriod) => void;
}

export function LeaderboardFilter({ period, onChange }: LeaderboardFilterProps) {
  return (
    <div className="flex justify-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            period === f.value
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
