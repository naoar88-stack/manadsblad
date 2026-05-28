import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Share2, Download, FileDown, Send, Loader2, X, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useExport } from '../hooks/useExport';

// Steg som visas i progress-overlayens under export
const EXPORT_STEPS = [
  'Förbereder canvas…',
  'Renderar innehåll…',
  'Komprimerar bild…',
  'Sparar fil…',
];

export const ExportModal = ({
  isOpen,
  onClose,
  schedule,
  monthLabel,
  format = 'a4-portrait',
  cloudEnabled = true,
}) => {
  const dialogRef = useRef(null);
  const closeRef  = useRef(null);

  // Progresstext som stegar framåt under export
  const [progressStep, setProgressStep] = useState(0);
  const progressTimerRef = useRef(null);

  const hasContent = Object.keys(schedule ?? {}).length > 0;
  const safeLabel  = monthLabel || 'Månadsblad';

  const {
    exporting,
    exportError,
    exportSuccess,
    downloadPNG,
    downloadPDF,
    cloudExport,
    webShare,
  } = useExport({ format, cloudEnabled, yardName: safeLabel });

  // Starta/stoppa progress-steg-timer i takt med export
  useEffect(() => {
    if (exporting) {
      setProgressStep(0);
      let step = 0;
      progressTimerRef.current = setInterval(() => {
        step = Math.min(step + 1, EXPORT_STEPS.length - 1);
        setProgressStep(step);
      }, 900);
    } else {
      clearInterval(progressTimerRef.current);
      setProgressStep(0);
    }
    return () => clearInterval(progressTimerRef.current);
  }, [exporting]);

  // Fokusera stängknappen när modalen öppnar
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Focus trap + Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (!exporting) { e.preventDefault(); onClose(); }
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = [
        ...dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    },
    [onClose, exporting],
  );

  const handleBackdropClick = useCallback(
    (e) => { if (e.target === e.currentTarget && !exporting) onClose(); },
    [onClose, exporting],
  );

  // Web Share med fallback till nedladdning om API saknas
  const handleWebShare = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      await webShare();
    } else {
      // Fallback: ladda ned PNG direkt på enheter utan Web Share API
      await downloadPNG();
    }
  }, [webShare, downloadPNG]);

  if (!isOpen) return null;

  const webShareLabel = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    ? 'Dela'
    : 'Dela (laddar ned)';

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Exportera ${safeLabel}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" aria-hidden="true" />
            Exportera månadsblad
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Stäng exportmodal"
            disabled={exporting}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8 items-start justify-center bg-slate-100/50">

          {/* Preview + feedback */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div
              id="export-canvas-root"
              className="w-[400px] max-w-full min-h-[400px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl flex flex-col p-6 text-white relative rounded-3xl"
              aria-label="Förhandsgranskning av månadsblad"
            >
              <h3 className="text-3xl font-black mb-6 uppercase tracking-wider">{safeLabel}</h3>

              <div className="flex flex-col gap-3 overflow-hidden">
                {Object.entries(schedule ?? {}).slice(0, 4).map(([day, acts]) => (
                  <div key={day} className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                    <div className="bg-white text-indigo-600 font-bold w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm">
                      {day}
                    </div>
                    <div className="flex flex-col">
                      {acts.map((a) => (
                        <span key={a.uniqueId} className="font-semibold text-sm flex items-center gap-1">
                          {a.icon} {a.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(schedule ?? {}).length > 4 && (
                  <p className="text-center text-white/70 text-sm mt-2 font-medium">
                    …och mycket mer! Se hela bladet i bion.
                  </p>
                )}

                {!hasContent && (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <div className="text-center bg-white/10 rounded-2xl px-6 py-8 border border-white/10">
                      <AlertCircle className="w-8 h-8 mx-auto mb-3 text-white/80" aria-hidden="true" />
                      <p className="text-white font-semibold">Inget att exportera ännu</p>
                      <p className="text-white/75 text-sm mt-1">Lägg till aktiviteter i kalendern först.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress-overlay med steg-text */}
              {exporting && (
                <div
                  className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center rounded-3xl"
                  aria-live="polite"
                  aria-label="Exporterar"
                >
                  <div className="bg-white text-slate-800 rounded-2xl px-5 py-4 shadow-lg flex flex-col items-center gap-2 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" aria-hidden="true" />
                      <span className="text-sm font-semibold">Exporterar…</span>
                    </div>
                    <p className="text-xs text-slate-500 text-center transition-all">
                      {EXPORT_STEPS[progressStep]}
                    </p>
                    {/* Progressbar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${((progressStep + 1) / EXPORT_STEPS.length) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={progressStep + 1}
                        aria-valuemin={1}
                        aria-valuemax={EXPORT_STEPS.length}
                        aria-label="Exportprogress"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success / error */}
            <div aria-live="polite" className="space-y-2">
              {exportError && (
                <div className="flex items-start gap-2 rounded-2xl bg-red-50 text-red-700 border border-red-200 px-4 py-3 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{exportError}</span>
                </div>
              )}
              {exportSuccess && (
                <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 text-sm" role="status">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{exportSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action panel */}
          <div className="flex flex-col gap-4 max-w-sm w-full">
            <h4 className="font-bold text-slate-800">Exportalternativ</h4>
            <p className="text-sm text-slate-600">
              Välj format beroende på om du vill ladda ned direkt, skapa PDF eller dela från mobilen.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {safeLabel.toLowerCase().replace(/\s+/g, '-')}
            </p>

            <button
              onClick={downloadPNG}
              disabled={!hasContent || exporting}
              className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.39)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting
                ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                : <Download className="w-5 h-5" aria-hidden="true" />}
              Ladda ner PNG
            </button>

            <button
              onClick={downloadPDF}
              disabled={!hasContent || exporting}
              className="bg-slate-900 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-5 h-5" aria-hidden="true" />
              Ladda ner PDF
            </button>

            <button
              onClick={handleWebShare}
              disabled={!hasContent || exporting}
              className="bg-white text-slate-800 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
              {webShareLabel}
            </button>

            <button
              onClick={cloudExport}
              disabled={!hasContent || exporting || !cloudEnabled}
              className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 border border-indigo-200 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-5 h-5" aria-hidden="true" />
              Molnexport
            </button>

            {!hasContent && (
              <p className="text-xs text-slate-400">
                Exportknappar aktiveras när månaden innehåller minst en aktivitet.
              </p>
            )}
            {!cloudEnabled && (
              <p className="text-xs text-slate-400">
                Molnexport är inaktiverad i inställningarna.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
