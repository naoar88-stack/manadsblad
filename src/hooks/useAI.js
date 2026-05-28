import { useState, useCallback } from 'react';
import { magicPaste, vasssa, generateImagePrompt } from '../lib/aiUtils';

/**
 * useAI — hanterar AI-anrop via /api/* server-side proxies.
 * VITE_GROQ_API_KEY används INTE längre — nyckeln hanteras enbart server-side.
 * hasKey är alltid true (vi litar på att servern är konfigurerad);
 * om servern saknar nyckeln returnerar /api/* ett tydligt felmeddelande.
 */
export function useAI() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState('');
  const [aiSuccess, setAiSuccess] = useState('');

  // Alltid true — nyckeln är server-side, klienten behöver inte veta om den finns
  const hasKey = true;

  const run = useCallback(async (fn) => {
    setAiLoading(true); setAiError(''); setAiSuccess('');
    try {
      const result = await fn();
      setAiSuccess('Klart!');
      setTimeout(() => setAiSuccess(''), 3000);
      return result;
    } catch (e) {
      setAiError(e.message || 'Okänt AI-fel.');
      setTimeout(() => setAiError(''), 6000);
      return null;
    } finally {
      setAiLoading(false);
    }
  }, []);

  // yearMonth skickas vidare till magicPaste för korrekt datumexpansion av veckodagsregler
  const runMagicPaste  = useCallback((text, yearMonth) => run(() => magicPaste(text, null, yearMonth)), [run]);
  // stavfel fixat: runVasssa → runVassa (ett s)
  const runVassa       = useCallback((activity)        => run(() => vasssa(activity, null)),             [run]);
  const runImagePrompt = useCallback((activity)        => run(() => generateImagePrompt(activity, null)), [run]);

  // Bakåtkompatibel alias så befintliga anrop till runVasssa inte kraschar
  const runVasssa = runVassa;

  return { aiLoading, aiError, aiSuccess, hasKey, runMagicPaste, runVassa, runVasssa, runImagePrompt };
}
