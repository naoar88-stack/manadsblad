import React, { useState } from 'react';
import { X } from 'lucide-react';

function RangeRow({ label, value, min, max, step = 1, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
        <span>{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-600" />
    </label>
  );
}

export function CropModal({ activity, onSave, onClose }) {
  const [crop, setCrop] = useState(activity?.crop ?? { x: 50, y: 50, zoom: 1 });
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-[30px] bg-white border border-slate-200 shadow-[0_32px_80px_rgba(15,23,42,0.18)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Bildjustering</h3>
            <p className="text-sm text-slate-500 mt-0.5">{activity.title}</p>
          </div>
          <button onClick={onClose} className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-slate-100 aspect-square relative">
            <img
              src={activity.image} alt={activity.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})`, transformOrigin: 'center' }}
            />
          </div>
          <div className="space-y-5">
            <RangeRow label="Horisontellt (X)" value={crop.x}    min={0}   max={100} onChange={v => setCrop(c => ({ ...c, x: v }))} />
            <RangeRow label="Vertikalt (Y)"    value={crop.y}    min={0}   max={100} onChange={v => setCrop(c => ({ ...c, y: v }))} />
            <RangeRow label="Zoom"             value={crop.zoom} min={1}   max={2}   step={0.01} onChange={v => setCrop(c => ({ ...c, zoom: v }))} />
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed">
              Kvadratisk beskärning (1:1) behålls alltid. CSS object-position och transform scale styr bilden utan att ramen ändrar storlek.
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm">Avbryt</button>
              <button onClick={() => onSave(crop)} className="flex-1 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition">Spara</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
