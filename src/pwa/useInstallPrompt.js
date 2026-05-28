/**
 * Hook: hanterar "Lägg till på startskärmen"-prompten.
 * Returnerar { canInstall, install, dismiss }
 *
 * canInstall: boolean — true = visa install-knapp
 * install:    () => void — triggar native install-prompt
 * dismiss:    () => void — döljer knappen för sessionen
 */
import { useState, useEffect, useCallback } from 'react';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall,     setCanInstall]     = useState(false);

  useEffect(() => {
    // Fånga beforeinstallprompt-eventet innan webbläsaren visar det själv
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Räkna bort om användaren installerar via annat sätt
    window.addEventListener('appinstalled', () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => setCanInstall(false), []);

  return { canInstall, install, dismiss };
}
