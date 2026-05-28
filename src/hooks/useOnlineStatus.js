/**
 * Hook: spårar online/offline-status i realtid.
 * Returnerar { isOnline: boolean }
 *
 * Används av App.jsx för att visa en offline-banner
 * och av skeleton-logiken för att avgränsa väntestates.
 */
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return { isOnline };
}
