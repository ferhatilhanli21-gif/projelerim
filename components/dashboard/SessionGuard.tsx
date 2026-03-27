'use client';

import { useEffect } from 'react';

/**
 * Tarayıcı/sekme kapatılırken açık mesai oturumunu otomatik durdurur.
 * sendBeacon → sayfa kapansa bile sunucuya ulaşır.
 */
export function SessionGuard() {
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon('/api/sessions/clock-out');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return null;
}
