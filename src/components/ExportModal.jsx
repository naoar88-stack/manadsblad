import React, { useRef, useEffect, useCallback } from 'react';
import { Share2, Download, X } from 'lucide-react';
import { exportAsPNG } from '../lib/exportUtils';

export const ExportModal = ({ isOpen, onClose, schedule, monthLabel }) => {
  const previewRef  = useRef(null);
  const closeRef    = useRef(null);

  const hasContent = Object.keys(schedule ?? {}).length > 0;
  const safeLabel  = monthLabel || 'M\u00e5nadsblad';
  const fileName   = `manadsblad-${safeLabel.toLowerCase().replace(/\s+/g, '-')}.png`;

  // Fokusera stängknappen när modalen öppnar
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => closeRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  // Escape stänger modalen
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Klick utanför dialogrutan stänger
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleDownload = async () => {
    const el = previewRef.current;
    if (!el) return;
    const tempId = '__export_modal_preview__';
    const prevId = el.id;
    if (!el.id) el.id = tempId;
    try {
      await exportAsPNG(el.id, fileName);
    } finally {
      el.id = prevId;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Exportera ${safeLabel}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" aria-hidden="true" />
            Exportera till Instagram
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Stäng exportmodal"
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 items-center justify-center bg-slate-100/50">
          <div
            ref={previewRef}
            className="w-[400px] h-[400px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-none shadow-xl flex flex-col p-6 text-white relative"
            aria-label="Förhandsgranskning"
          >
            <h3 className="text-3xl font-black mb-6 uppercase tracking-wider">
              {safeLabel}
            </h3>

            <div className="flex flex-col gap-3 overflow-hidden">
              {Object.entries(schedule ?? {}).slice(0, 4).map(([day, acts]) => (
                <div
                  key={day}
                  className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3"
                >
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
                  ...och mycket mer! Se hela bladet i bion.
                </p>
              )}

              {!hasContent && (
                <p className="text-white/80 text-sm font-medium">
                  Lägg till några aktiviteter i kalendern för att skapa en exportbild.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-xs">
            <h4 className="font-bold text-slate-800">Redo att publiceras!</h4>
            <p className="text-sm text-slate-600">
              Klicka på knappen nedan för att ladda ner förhandsgranskningen som en PNG-bild.
            </p>
            <p className="text-xs text-slate-400 font-mono">{fileName}</p>

            <button
              onClick={handleDownload}
              disabled={!hasContent}
              className="mt-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.39)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Ladda ner bild
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
