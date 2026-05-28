import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

/**
 * Inline Vässa-knapp som visas bredvid aktivitetens titel i SchemaView.
 * Klick → Groq förbättrar titel + beskrivning → anropar onUpdate.
 * Anrop sker via /api/improve-text (server-side proxy — nyckeln exponeras aldrig).
 */
export function VassaButton({ activity, onUpdate }) {
  // stavfel fixat: runVasssa (3s) → runVassa (1s)
  const { aiLoading, runVassa } = useAI();
  const [done, setDone] = useState(false);

  const handleVassa = async (e) => {
    e.stopPropagation();
    const result = await runVassa(activity);
    if (result) {
      onUpdate(result);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <button
      onClick={handleVassa}
      disabled={aiLoading}
      title="Vässa med AI"
      aria-label={done ? 'Vassad!' : 'Vässa aktivitet med AI'}
      aria-busy={aiLoading}
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
