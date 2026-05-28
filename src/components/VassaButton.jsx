import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle2 } from 'lucide-react';
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
      aria-label={done ? 'Vassad!' : 'Vässa aktivitet med AI'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold
        border transition-all duration-150 active:scale-95
        disabled:opacity-60 disabled:pointer-events-none
        ${
          done
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 hover:border-indigo-300'
        }`}
      style={{ boxShadow: done ? '0 1px 3px rgba(16,185,129,0.12)' : '0 1px 3px rgba(79,70,229,0.10)' }}
    >
      {aiLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        : done
          ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          : <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />}
      {done ? 'Vassad!' : 'Vässa'}
    </button>
  );
}
