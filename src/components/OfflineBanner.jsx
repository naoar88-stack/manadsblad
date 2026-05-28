/**
 * OfflineBanner — diskret banner längst upp när appen är offline.
 * Visas/döljs med CSS-transition, inget hopp i layouten.
 */
import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner({ isOnline }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isOnline ? '' : 'Ingen internetanslutning'}
      className={`offline-banner${isOnline ? ' offline-banner--hidden' : ''}`}
    >
      <WifiOff size={14} aria-hidden="true" />
      <span>Ingen anslutning — ändringar sparas lokalt</span>
    </div>
  );
}
