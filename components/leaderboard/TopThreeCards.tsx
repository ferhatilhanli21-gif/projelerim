'use client';

import { LeaderboardEntry } from '@/types';
import { formatDuration } from '@/lib/duration';
import { Crown } from 'lucide-react';

const RANK_STYLES = [
  { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600', label: '🥇' },
  { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-500', label: '🥈' },
  { border: 'border-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', label: '🥉' },
];

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-14 h-14 rounded-full object-cover" />;
  }
  return (
    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const CSS = `
  @keyframes spin-cw  { to { transform: rotate(360deg); } }
  @keyframes spin-ccw { to { transform: rotate(-360deg); } }
  @keyframes pulse-gold {
    0%,100% { box-shadow: 0 0 16px 4px rgba(250,204,21,.45), 0 0 40px 10px rgba(250,204,21,.18); }
    50%     { box-shadow: 0 0 30px 8px rgba(250,204,21,.75), 0 0 65px 20px rgba(250,204,21,.3); }
  }
  @keyframes float-crown {
    0%,100% { transform: translateY(0)   rotate(-5deg); }
    50%     { transform: translateY(-6px) rotate(5deg);  }
  }
  @keyframes gold-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .card-first       { animation: pulse-gold 2.2s ease-in-out infinite; }
  .ring-cw          { animation: spin-cw  4s linear infinite; }
  .ring-ccw         { animation: spin-ccw 3s linear infinite; }
  .crown-float      { animation: float-crown 2.2s ease-in-out infinite; }
  .gold-text {
    background: linear-gradient(90deg,#92400e 0%,#facc15 28%,#fef9c3 50%,#facc15 72%,#92400e 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gold-shimmer 2.6s linear infinite;
  }
`;

export function TopThreeCards({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;

  const maxMinutes = entries[0]?.total_minutes ?? 1;

  return (
    <>
      <style>{CSS}</style>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {entries.map((entry, i) => {
          const style = RANK_STYLES[i];
          const pct = Math.round((entry.total_minutes / maxMinutes) * 100);
          const isFirst = i === 0;

          return (
            <div
              key={entry.user_id}
              className={[
                'relative rounded-xl border-2 p-5 flex flex-col items-center gap-3 overflow-visible',
                style.border,
                style.bg,
                isFirst ? 'card-first sm:order-1 sm:scale-110' : i === 1 ? 'sm:order-0' : 'sm:order-2',
              ].join(' ')}
              style={isFirst ? { zIndex: 2 } : {}}
            >

              {/* Content (above canvas) */}
              <div className="relative flex flex-col items-center gap-3 w-full" style={{ zIndex: 1 }}>
                {isFirst ? (
                  <Crown className="crown-float text-yellow-500 fill-yellow-400 h-7 w-7" />
                ) : (
                  <span className="text-2xl">{style.label}</span>
                )}

                {/* Avatar */}
                {isFirst ? (
                  <div style={{
                    padding: '3px',
                    borderRadius: '9999px',
                    background: 'conic-gradient(#facc15 0deg, #f97316 120deg, #fef08a 240deg, #facc15 360deg)',
                  }}>
                    <div className="rounded-full overflow-hidden bg-yellow-50">
                      <Avatar name={entry.full_name} avatarUrl={entry.avatar_url} />
                    </div>
                  </div>
                ) : (
                  <Avatar name={entry.full_name} avatarUrl={entry.avatar_url} />
                )}

                <div className="text-center">
                  <p className={`font-semibold ${isFirst ? 'gold-text text-base' : 'text-gray-800 text-sm'}`}>
                    {entry.full_name}
                  </p>
                  {entry.is_active_session && (
                    <span className="text-xs text-green-600 font-medium">(devam ediyor)</span>
                  )}
                </div>

                <span className={`font-mono font-bold ${isFirst ? 'gold-text text-xl' : `text-lg ${style.text}`}`}>
                  {formatDuration(entry.total_minutes)}
                </span>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isFirst
                        ? 'linear-gradient(90deg,#facc15,#f97316,#facc15)'
                        : '#ef4444',
                    }}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
