'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  fullName: string;
}

export function PresenceTracker({ userId, fullName }: Props) {
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase.channel('online-users');
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          full_name: fullName,
          online_at: new Date().toISOString(),
        });
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [userId, fullName]);

  return null;
}
