'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WorkSession } from '@/types';

export function useCurrentSession() {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .maybeSingle();

    setSession(data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, refetch: fetchSession };
}
