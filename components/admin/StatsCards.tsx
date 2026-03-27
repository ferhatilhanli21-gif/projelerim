'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Calendar, CalendarDays } from 'lucide-react';
import { formatDuration } from '@/lib/duration';
import { AdminStats } from '@/types';

export function StatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
  }, []);

  const cards = [
    {
      label: 'Şu An Mesaide',
      value: stats ? `${stats.active_now} kişi` : '—',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Bugün Toplam',
      value: stats ? formatDuration(stats.today_total_minutes) : '—',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Bu Hafta',
      value: stats ? formatDuration(stats.week_total_minutes) : '—',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Bu Ay',
      value: stats ? formatDuration(stats.month_total_minutes) : '—',
      icon: CalendarDays,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex items-center gap-3 py-4">
            <div className={`p-2.5 rounded-lg ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="font-bold text-gray-800 font-mono">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
