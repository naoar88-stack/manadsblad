import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

export function MagicPasteModal({ onImport, onClose }) {
  const [text, setText] = useState('');
  const { aiLoading, aiError, aiSuccess, hasKey, runMagicPaste } = useAI();

  const handlePaste = async () => {
    if (!text.trim()) return;
    const results = await runMagicPaste(text);
    if (results?.length) onImport(results);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-[0_32px_80px_rgba(15,23,42,0.22)] border border-white/60">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Magic Paste</h2>
              <p className="text-sm text-slate-500">Klistra in text — AI skapar aktiviteterna åt dig</p>
            </div>
            <button onClick={onClose} className="ml-auto h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {!hasKey && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700 mb-4">
              <strong>VITE_GROQ_API_KEY</strong> saknas — lägg till den i Vercel Environment Variables och redeploya.
            </div>
          )}

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Klistra in text från e-post, dokument eller anteckningar...\n\nExempel:\nFredagar 15-17: Gaming-kväll för 13–17 år\nLördag 12 juni: Sommarfest, anmälan krävs`}
            className="w-full h-44 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
          />

          {aiError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-center gap-2 mt-3">
              <AlertCircle className="w-4 h-4 shrink-0" />{aiError}
            </div>
          )}
          {aiSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 mt-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />{aiSuccess}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition">
              Avbryt
            </button>
            <button
              onClick={handlePaste}
              disabled={aiLoading || !text.trim() || !hasKey}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {aiLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Analyserar…</>
                : <><Sparkles className="w-4 h-4" />Importera aktiviteter</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
