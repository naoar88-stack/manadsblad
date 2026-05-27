import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2, Wand2, ClipboardPaste } from 'lucide-react';
import { useAI } from '../hooks/useAI';

const EXAMPLES = [
  'Alla onsdagar kl 15–17: Matlagning 10–13 år',
  'Alla fredagar: Gaming-kväll 13–17 år',
  'Lördag 7 juni: Sommarfest, anmälan krävs',
  'Tisdag & torsdag: Basket 13–15 år, kostnad 20 kr',
];

export function MagicPasteModal({ onImport, onClose, yearMonth }) {
  const [text, setText] = useState('');
  const { aiLoading, aiError, aiSuccess, hasKey, runMagicPaste } = useAI();

  const handlePaste = async () => {
    if (!text.trim()) return;
    const results = await runMagicPaste(text, yearMonth);
    if (results?.length) onImport(results);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setText(t);
    } catch { /* permission denied */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-enter w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <Wand2 size={18} className="text-purple-300" />
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight">Magic Paste</h2>
              <p className="text-xs text-purple-300/80 font-medium mt-0.5">AI analyserar och skapar aktiviteter</p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Info-banner */}
          <div className="rounded-2xl px-4 py-3 text-xs text-purple-200 leading-relaxed"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
            Klistra in text från e-post, dokument eller anteckningar.{' '}
            Regler som <span className="text-purple-100 font-bold">"alla onsdagar = dans"</span> expanderas automatiskt
            {yearMonth ? ` för ${yearMonth}` : ''}.
          </div>

          {/* Saknad API-nyckel */}
          {!hasKey && (
            <div className="rounded-2xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2.5"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-200">VITE_GROQ_API_KEY</span> saknas —{' '}
                lägg till i Vercel → Settings → Environment Variables.
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Klistra in text här…\n\nExempel:\n${EXAMPLES.join('\n')}`}
              className="w-full h-48 rounded-2xl px-4 py-3.5 text-sm resize-none outline-none text-slate-100 placeholder:text-slate-500 leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
            {/* Klistra från urklipp */}
            {!text && (
              <button onClick={handlePasteFromClipboard}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white transition"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <ClipboardPaste size={12} /> Klistra från urklipp
              </button>
            )}
            {text && (
              <button onClick={() => setText('')}
                className="absolute top-3 right-3 h-6 w-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Exempel-snabbval */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest">Exempelrader — klicka för att lägga till</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => (
                <button key={i}
                  onClick={() => setText(t => t ? t + '\n' + ex : ex)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-purple-300 hover:text-white transition"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  + {ex.slice(0, 36)}{ex.length > 36 ? '…' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Error / success */}
          {aiError && (
            <div className="rounded-2xl px-4 py-3 text-sm text-rose-300 flex items-center gap-2.5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={14} className="shrink-0" /> {aiError}
            </div>
          )}
          {aiSuccess && (
            <div className="rounded-2xl px-4 py-3 text-sm text-emerald-300 flex items-center gap-2.5"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <CheckCircle2 size={14} className="shrink-0" /> {aiSuccess}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-slate-300 hover:text-white font-semibold text-sm transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              Avbryt
            </button>
            <button onClick={handlePaste}
              disabled={aiLoading || !text.trim() || !hasKey}
              className="btn-ai flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {aiLoading
                ? <><Loader2 size={15} className="animate-spin" /> Analyserar…</>
                : <><Sparkles size={15} /> Importera aktiviteter</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
