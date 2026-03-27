import { LeaderboardEntry } from '@/types';
import { formatDuration } from '@/lib/duration';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  startRank: number;
}

export function LeaderboardList({ entries, startRank }: LeaderboardListProps) {
  const maxMinutes = entries[0]?.total_minutes ?? 1;

  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        {entries.map((entry, i) => {
          const rank = startRank + i;
          const pct = Math.round((entry.total_minutes / maxMinutes) * 100);

          return (
            <div key={entry.user_id} className="flex items-center gap-3">
              <span className="w-6 text-sm text-gray-400 font-mono text-center">{rank}</span>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm flex-shrink-0">
                {entry.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {entry.full_name}
                    {entry.is_active_session && (
                      <span className="ml-1.5 text-xs text-green-600">(devam ediyor)</span>
                    )}
                  </span>
                  <span className="text-sm font-mono font-semibold text-gray-700 ml-2 flex-shrink-0">
                    {formatDuration(entry.total_minutes)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-red-400 h-1 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
