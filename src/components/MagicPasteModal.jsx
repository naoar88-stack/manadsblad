import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2, Wand2, ClipboardPaste } from 'lucide-react';
import { useAI } from '../hooks/useAI';

const EXAMPLES = [
  'Alla onsdagar kl 15–17: Matlagning 10–13 år',
  'Alla fredagar: Gaming-kväll 13–17 år',
  'Lördag 7 juni: Sommarfest, anmälan krävs',
  'Tisdag & torsdag: Basket 13–15 år, kostnad 20 kr',
];

const MAX_TEXT_LENGTH = 3000;

export function MagicPasteModal({ onImport, onClose, yearMonth }) {
  const [text, setText] = useState('');
  const { aiLoading, aiError, aiSuccess, runMagicPaste } = useAI();
  const closeRef  = useRef(null);
  const dialogRef = useRef(null);

  // Fokus på stäng-knapp vid öppning
  useEffect(() => { closeRef.current?.focus(); }, []);

  // Escape stänger modalen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Fälla fokus inuti dialogen (a11y)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener('keydown', trapFocus);
    return () => dialog.removeEventListener('keydown', trapFocus);
  }, []);

  const handlePaste = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const results = await runMagicPaste(trimmed, yearMonth);
    if (results?.length) onImport(results);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setText(t.slice(0, MAX_TEXT_LENGTH));
    } catch { /* permission denied — tyst fail är OK */ }
  };

  const charsLeft = MAX_TEXT_LENGTH - text.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
      // BUGG-FIX: aria-hidden tog bort — overlay ska INTE dölja dialogen för skärmläsare
      // Bakgrunden stängs av från a11y-trädet med aria-hidden på app-roten (se index.html) vid modal-öppning
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="magic-paste-title"
        className="modal-enter w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)', border: '1px solid rgba(139,92,246,0.3)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <Wand2 size={18} className="text-purple-300" aria-hidden="true" />
            </div>
            <div>
              <h2 id="magic-paste-title" className="font-black text-white text-base tracking-tight">Magic Paste</h2>
              <p className="text-xs text-purple-300/80 font-medium mt-0.5">AI analyserar och skapar aktiviteter</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Stäng Magic Paste"
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-2xl px-4 py-3 text-xs text-purple-200 leading-relaxed"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
            Klistra in text från e-post, dokument eller anteckningar.{' '}
            Regler som <span className="text-purple-100 font-bold">"alla onsdagar = dans"</span> expanderas automatiskt
            {yearMonth ? ` för ${yearMonth}` : ''}.
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
              placeholder={`Klistra in text här…\n\nExempel:\n${EXAMPLES.join('\n')}`}
              aria-label="Text att analysera"
              aria-describedby="chars-left"
              maxLength={MAX_TEXT_LENGTH}
              className="w-full h-48 rounded-2xl px-4 py-3.5 text-sm resize-none outline-none text-slate-100 placeholder:text-slate-500 leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
            {/* Teckenräknare */}
            <span
              id="chars-left"
              aria-live="polite"
              className="absolute bottom-3 left-4 text-[10px] pointer-events-none"
              style={{ color: charsLeft < 200 ? 'rgba(251,191,36,0.8)' : 'rgba(148,163,184,0.5)' }}
            >
              {charsLeft < MAX_TEXT_LENGTH ? `${charsLeft} tecken kvar` : ''}
            </span>
            {!text && (
              <button
                onClick={handlePasteFromClipboard}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white transition"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <ClipboardPaste size={12} aria-hidden="true" /> Klistra från urklipp
              </button>
            )}
            {text && (
              <button
                onClick={() => setText('')}
                aria-label="Rensa text"
                className="absolute top-3 right-3 h-6 w-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest">Exempelrader — klicka för att lägga till</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(t => {
                    const next = t ? t + '\n' + ex : ex;
                    return next.slice(0, MAX_TEXT_LENGTH);
                  })}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-purple-300 hover:text-white transition"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  + {ex.slice(0, 36)}{ex.length > 36 ? '…' : ''}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <div
              role="alert"
              className="rounded-2xl px-4 py-3 text-sm text-rose-300 flex items-center gap-2.5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={14} className="shrink-0" aria-hidden="true" /> {aiError}
            </div>
          )}
          {aiSuccess && (
            <div
              role="status"
              className="rounded-2xl px-4 py-3 text-sm text-emerald-300 flex items-center gap-2.5"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" /> {aiSuccess}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-slate-300 hover:text-white font-semibold text-sm transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              Avbryt
            </button>
            <button
              onClick={handlePaste}
              disabled={aiLoading || !text.trim()}
              className="btn-ai flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              aria-busy={aiLoading}
            >
              {aiLoading
                ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Analyserar…</>
                : <><Sparkles size={15} aria-hidden="true" /> Importera aktiviteter</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
