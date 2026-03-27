'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono font-tabular text-4xl font-bold tracking-widest">
      {time}
    </span>
  );
}
