'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/types';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnread(data.unread ?? 0);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'POST' });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const typeIcon: Record<string, string> = {
    message: '💬',
    announcement: '📢',
    leave_request: '📋',
    leave_update: '✅',
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="font-semibold text-sm text-gray-800">Bildirimler</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-red-600 hover:underline">
                  Tümünü okundu say
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Bildirim yok</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-sm ${!n.is_read ? 'bg-red-50' : ''}`}
                  >
                    <span className="mr-2">{typeIcon[n.type] ?? '🔔'}</span>
                    {n.body}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
