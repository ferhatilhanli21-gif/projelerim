export function calculateDuration(
  clockIn: Date,
  clockOut: Date
): { hours: number; minutes: number; totalMinutes: number } {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0dk';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}dk`;
  if (m === 0) return `${h}s`;
  return `${h}s ${m}dk`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Aktif oturumun anlık süresini hesapla
export function getLiveMinutes(clockIn: string): number {
  const start = new Date(clockIn).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60));
}
