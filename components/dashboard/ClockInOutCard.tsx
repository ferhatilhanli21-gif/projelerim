'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Clock } from '@/components/common/Clock';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DurationDisplay } from '@/components/common/DurationDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { WorkSession } from '@/types';
import { getLiveMinutes } from '@/lib/duration';

interface ClockInOutCardProps {
  userId: string;
}

export function ClockInOutCard({ userId }: ClockInOutCardProps) {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [liveMinutes, setLiveMinutes] = useState(0);

  const fetchSession = useCallback(async () => {
    const res = await fetch('/api/sessions/current');
    const data = await res.json();
    setSession(data.session);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (!session?.clock_in) return;
    const interval = setInterval(() => {
      setLiveMinutes(getLiveMinutes(session.clock_in));
    }, 1000);
    setLiveMinutes(getLiveMinutes(session.clock_in));
    return () => clearInterval(interval);
  }, [session]);

  async function handleClockIn() {
    setActionLoading(true);
    const res = await fetch('/api/sessions/clock-in', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setSession(data.session);
      toast.success('Mesaiye başladınız!');
    } else {
      toast.error(data.error);
    }
    setActionLoading(false);
  }

  async function handleClockOut() {
    setShowConfirm(false);
    setActionLoading(true);
    const res = await fetch('/api/sessions/clock-out', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setSession(null);
      setLiveMinutes(0);
      toast.success('Mesai bitirildi!');
    } else {
      toast.error(data.error);
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <Clock />
          <StatusBadge isActive={!!session} />

          {session && (
            <div className="text-center">
              <p className="text-sm text-gray-500">Bugün çalışma süresi</p>
              <DurationDisplay totalMinutes={liveMinutes} className="text-2xl text-red-600" />
            </div>
          )}

          {session ? (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={actionLoading}
              className="w-48 bg-red-600 hover:bg-red-700 text-white active:scale-95 transition-transform"
            >
              Mesaiyi Bitir
            </Button>
          ) : (
            <Button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="w-48 bg-green-600 hover:bg-green-700 text-white active:scale-95 transition-transform"
            >
              Mesaiye Başla
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesaiyi bitirmek istiyor musunuz?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Şu ana kadar <strong><DurationDisplay totalMinutes={liveMinutes} /></strong> çalıştınız.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              İptal
            </Button>
            <Button
              onClick={handleClockOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Evet, Bitir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
