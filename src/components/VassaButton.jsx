import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

/**
 * Inline Vässa-knapp som visas bredvid aktivitetens titel i SchemaView.
 * Klick → Gemini förbättrar titel + beskrivning → anropar onUpdate.
 */
export function VassaButton({ activity, onUpdate }) {
  const { aiLoading, runVasssa, hasKey } = useAI();
  const [done, setDone] = useState(false);

  if (!hasKey) return null;

  const handleVasssa = async (e) => {
    e.stopPropagation();
    const result = await runVasssa(activity);
    if (result) {
      onUpdate(result);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <button
      onClick={handleVasssa}
      disabled={aiLoading}
      title="Vässa med Gemini AI"
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
        done
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
      } disabled:opacity-60`}
    >
      {aiLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Wand2 className="w-3.5 h-3.5" />}
      {done ? 'Vassad!' : 'Vässa'}
    </button>
  );
}
