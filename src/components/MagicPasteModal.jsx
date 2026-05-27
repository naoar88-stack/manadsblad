import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div
        className="glass-dark rounded-3xl w-full max-w-lg overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.25), 0 32px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139,92,246,0.5)',
            }}>
              <Wand2 size={18} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base">Magic Paste</div>
              <div className="text-xs text-slate-400">AI analyserar och skapar aktiviteter</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Klistra in text från e-post, dokument eller anteckningar.{' '}
            <span style={{ color: '#a855f7', fontWeight: 600 }}>Veckodagsregler</span>{' '}
            som "alla onsdagar = matlagning" expanderas automatiskt till varje vecka i <strong className="text-white">{yearMonth}</strong>.
          </p>

          {!hasKey && (
            <div className="rounded-2xl px-4 py-3 text-sm text-amber-300 flex items-center gap-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <AlertCircle size={14} className="shrink-0" />
              <span><strong>VITE_GROQ_API_KEY</strong> saknas — lägg till i Vercel Environment Variables.</span>
            </div>
          )}

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Klistra in text här…\n\nExempel:\nAlla onsdagar kl 15–17: Matlagning 10–13 år\nAlla fredagar: Gaming-kväll 13–17 år\nLördag 7 juni: Sommarfest, anmälan krävs`}
            className="w-full h-44 rounded-2xl px-4 py-3.5 text-sm resize-none outline-none placeholder:text-slate-500 text-slate-100"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
          />

          {aiError && (
            <div className="rounded-2xl px-4 py-3 text-sm text-rose-300 flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={14} className="shrink-0" />{aiError}
            </div>
          )}
          {aiSuccess && (
            <div className="rounded-2xl px-4 py-3 text-sm text-emerald-300 flex items-center gap-2"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <CheckCircle2 size={14} className="shrink-0" />{aiSuccess}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-slate-300 font-semibold text-sm transition hover:bg-white/8"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              Avbryt
            </button>
            <button
              onClick={handlePaste}
              disabled={aiLoading || !text.trim() || !hasKey}
              className="btn-ai flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {aiLoading
                ? <><Loader2 size={15} className="animate-spin" />Analyserar…</>
                : <><Sparkles size={15} />Importera aktiviteter</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
