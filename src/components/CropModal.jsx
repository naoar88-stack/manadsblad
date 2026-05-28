import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

function RangeRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-indigo-600 tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500 h-2 cursor-pointer"
        aria-label={label} />
    </div>
  );
}

const DEFAULT_CROP = { x: 50, y: 50, zoom: 1 };

export function CropModal({ activity, onSave, onClose }) {
  const [crop, setCrop] = useState(activity?.crop ?? DEFAULT_CROP);
  const closeRef = useRef(null);

  // Fokus på stäng-knapp vid öppning
  useEffect(() => { closeRef.current?.focus(); }, []);

  // Escape-tangenten stänger modalen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!activity) return null;

  const reset = () => setCrop(DEFAULT_CROP);
  const isDefault = crop.x === 50 && crop.y === 50 && crop.zoom === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bildjustering"
        className="modal-enter bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-base">Bildjustering</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[240px]">{activity.title}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Stäng bildjustering"
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        {/* Förhandsvisning */}
        <div className="px-6 pt-5">
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={activity.image}
              alt={activity.title}
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: 'cover',
                objectPosition: `${crop.x}% ${crop.y}%`,
                transform: `scale(${crop.zoom})`,
                transformOrigin: `${crop.x}% ${crop.y}%`,
                transition: 'object-position 0.15s ease, transform 0.15s ease',
              }}
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '33.3% 33.3%',
              }} />
            {/* Centrum-markör */}
            <div className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
              style={{ left: `calc(${crop.x}% - 10px)`, top: `calc(${crop.y}% - 10px)`, transition: 'left 0.15s, top 0.15s' }} />
          </div>
        </div>

        {/* Kontroller */}
        <div className="px-6 py-5 space-y-5">
          <RangeRow label="Horisontell position" value={crop.x} min={0} max={100} unit="%" onChange={v => setCrop(c => ({ ...c, x: v }))} />
          <RangeRow label="Vertikal position"    value={crop.y} min={0} max={100} unit="%" onChange={v => setCrop(c => ({ ...c, y: v }))} />
          <RangeRow label="Zoom"                  value={crop.zoom} min={1} max={2} step={0.05} onChange={v => setCrop(c => ({ ...c, zoom: v }))} />

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            Bilden beskärs med CSS <code className="text-indigo-500">object-position</code> och <code className="text-indigo-500">scale</code> — originalfilen påverkas inte.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={reset} disabled={isDefault}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 transition disabled:opacity-40">
            <RotateCcw size={13} /> Återställ
          </button>
          <div className="flex-1" />
          <button onClick={onClose}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 transition">
            Avbryt
          </button>
          <button onClick={() => onSave(crop)}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 transition">
            <Check size={14} /> Spara
          </button>
        </div>
      </div>
    </div>
  );
}
