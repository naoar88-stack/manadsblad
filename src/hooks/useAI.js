import { useState, useCallback } from 'react';
import { magicPaste, vasssa, generateImagePrompt } from '../lib/aiUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function useAI() {
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError,   setAiError]     = useState('');
  const [aiSuccess, setAiSuccess]   = useState('');

  const hasKey = !!API_KEY;

  const run = useCallback(async (fn) => {
    setAiLoading(true);
    setAiError('');
    setAiSuccess('');
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

  const runMagicPaste = useCallback(
    (text) => run(() => magicPaste(text, API_KEY)),
    [run]
  );

  const runVasssa = useCallback(
    (activity) => run(() => vasssa(activity, API_KEY)),
    [run]
  );

  const runImagePrompt = useCallback(
    (activity) => run(() => generateImagePrompt(activity, API_KEY)),
    [run]
  );

  return { aiLoading, aiError, aiSuccess, hasKey, runMagicPaste, runVasssa, runImagePrompt };
}
