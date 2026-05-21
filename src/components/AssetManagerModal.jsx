import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
];

const TABS = [['library','Bibliotek'],['upload','Ladda upp'],['generate','Generera (AI)']];

export function AssetManagerModal({ activity, onSelect, onClose }) {
  const [tab, setTab] = useState('library');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-[30px] bg-white border border-slate-200 shadow-[0_32px_80px_rgba(15,23,42,0.18)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Asset Manager</h3>
            <p className="text-sm text-slate-500 mt-0.5">{activity?.title}</p>
          </div>
          <button onClick={onClose} className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${ tab === id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' }`}>{label}</button>
          ))}
        </div>

        {tab === 'library' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMAGE_POOL.map((img, i) => (
              <button key={img} onClick={() => onSelect(img)} className={`rounded-[22px] overflow-hidden border-2 transition hover:-translate-y-0.5 ${ activity?.image === img ? 'border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.18)]' : 'border-transparent hover:border-slate-300' }`}>
                <div className="aspect-square"><img src={img} alt={`Bild ${i+1}`} className="w-full h-full object-cover" /></div>
              </button>
            ))}
          </div>
        )}

        {tab === 'upload' && (
          <div className="rounded-[26px] border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-lg font-bold mb-2">Drag & drop till Firebase Storage</div>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Komprimering sker automatiskt innan uppladdning. Stöd för JPG, PNG och WebP.</p>
            <button className="mt-5 px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold">Välj fil</button>
          </div>
        )}

        {tab === 'generate' && activity && (
          <div className="grid md:grid-cols-[1fr_0.8fr] gap-5 items-start">
            <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
                <Sparkles className="w-4 h-4" />Imagen 4 prompt
              </div>
              <div className="text-lg font-bold mb-2">{activity.title}</div>
              <p className="text-sm text-slate-600 mb-4">Skapar en högupplöst, ungdomlig och varm bild som passar rubriken. Fokus på svensk fritidsgårdsmiljö.</p>
              <button onClick={() => onSelect(IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)])} className="w-full px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition">
                Generera ny AI-bild
              </button>
            </div>
            <div className="rounded-[24px] overflow-hidden border border-slate-200">
              <img src={activity.image} alt={activity.title} className="w-full aspect-square object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
