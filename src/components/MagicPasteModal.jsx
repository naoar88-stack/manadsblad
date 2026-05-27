import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

export function MagicPasteModal({ onImport, onClose, yearMonth }) {
  const [text, setText] = useState('');
  const { aiLoading, aiError, aiSuccess, hasKey, runMagicPaste } = useAI();

  const handlePaste = async () => {
    if (!text.trim()) return;
    const results = await runMagicPaste(text, yearMonth);
    if (results?.length) onImport(results);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Magic Paste</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Klistra in text — AI skapar aktiviteterna och placerar dem på rätt datum i <strong>{yearMonth}</strong>.
          Veckodagsregler som &ldquo;alla onsdagar = matlagning&rdquo; expanderas automatiskt till varje vecka.
        </p>

        {!hasKey && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
            <strong>VITE_GROQ_API_KEY</strong> saknas — lägg till den i Vercel Environment Variables.
          </div>
        )}

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Klistra in text från e-post, dokument eller anteckningar...

Exempel:
Alla onsdagar kl 15–17: Matlagning för 10–13 år
Alla fredagar: Gaming-kväll 13–17 år
Lördag 7 juni: Sommarfest, anmälan krävs"
          className="w-full h-48 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
        />

        {aiError && (
          <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{aiError}
          </div>
        )}
        {aiSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />{aiSuccess}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition">
            Avbryt
          </button>
          <button onClick={handlePaste} disabled={aiLoading || !text.trim() || !hasKey}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
            {aiLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Analyserar…</>
              : <><Sparkles className="w-4 h-4" />Importera aktiviteter</>}
          </button>
        </div>
      </div>
    </div>
  );
}
