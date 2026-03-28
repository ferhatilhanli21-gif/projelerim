'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOnlineUsers(): Set<string> {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const ids = new Set(
          Object.values(state).flat().map((p) => p.user_id)
        );
        setOnlineIds(ids);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return onlineIds;
}
