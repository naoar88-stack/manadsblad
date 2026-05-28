import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [status, setStatus] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'
  );
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setStatus('offline');
      setReconnecting(false);
    };
    const goOnline = () => {
      setReconnecting(true);
      // kort fördröjning — verifiera att anslutningen faktiskt fungerar
      setTimeout(() => {
        setStatus('online');
        setReconnecting(false);
      }, 1200);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const isHidden = status === 'online' && !reconnecting;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={status === 'offline' ? 'Ingen internetanslutning' : reconnecting ? 'Återansluter' : ''}
      className={`offline-banner ${isHidden ? 'offline-banner--hidden' : ''}`}
      style={{
        background:
          reconnecting ? '#d97706'
          : status === 'offline' ? '#dc2626'
          : '#16a34a',
      }}
    >
      {reconnecting ? (
        <><RefreshCw size={13} className="animate-spin" aria-hidden="true" /> Återansluter…</>
      ) : status === 'offline' ? (
        <><WifiOff size={13} aria-hidden="true" /> Ingen anslutning — ändringar sparas lokalt</>
      ) : (
        <><Wifi size={13} aria-hidden="true" /> Ansluten igen</>
      )}
    </div>
  );
}
