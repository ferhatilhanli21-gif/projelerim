import { formatDuration } from '@/lib/duration';

interface DurationDisplayProps {
  totalMinutes: number;
  className?: string;
}

export function DurationDisplay({ totalMinutes, className = '' }: DurationDisplayProps) {
  return (
    <span className={`font-mono font-tabular font-semibold ${className}`}>
      {formatDuration(totalMinutes)}
    </span>
  );
}
