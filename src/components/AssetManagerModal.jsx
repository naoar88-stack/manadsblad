import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Loader2, Check, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [tab, setTab]           = useState('generate');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genResult, setGenResult] = useState(null);   // { url, publicId }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  // ── Anropa verklig AI-backend (/api/generate-image) ──
  const handleGenerate = async () => {
    if (!activity?.title) return;
    setGenerating(true);
    setGenError('');
    setGenResult(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activity.title }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Serverfel ${res.status}`);
      }
      setGenResult(data);
    } catch (err) {
      console.error('generate-image:', err);
      setGenError(err.message || 'Okänt fel — försök igen');
    } finally {
      setGenerating(false);
    }
  };

  // ── Fil-uppladdning (direkt via Cloudinary unsigned eller base64) ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onSelect(ev.target.result);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-enter bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-base">Asset Manager</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[320px]">
              {activity?.title}
            </p>
          </div>
          <button onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
            <X size={16}/>
          </button>
        </div>

        {/* Flikar */}
        <div className="flex gap-2 px-6 pt-4">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                tab === id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── BIBLIOTEK ── */}
        {tab === 'library' && (
          <div className="p-6 grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto">
            {IMAGE_POOL.map((img, i) => (
              <button key={i} onClick={() => { onSelect(img); onClose(); }}
                className={`rounded-2xl overflow-hidden border-2 transition hover:-translate-y-0.5 ${
                  activity?.image === img
                    ? 'border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.18)]'
                    : 'border-transparent hover:border-slate-300'
                }`}>
                <img src={img} alt={`Bild ${i+1}`}
                  className="w-full h-24 object-cover block"
                  loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* ── LADDA UPP ── */}
        {tab === 'upload' && (
          <div className="p-6">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 transition disabled:opacity-50">
              {uploading
                ? <Loader2 size={24} className="animate-spin text-indigo-500"/>
                : <Upload size={24}/>}
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">
                  {uploading ? 'Laddar upp…' : 'Klicka för att välja fil'}
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — komprimeras automatiskt</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handleFileChange}/>
            {uploadError && (
              <p className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle size={13}/> {uploadError}
              </p>
            )}
          </div>
        )}

        {/* ── GENERERA (AI) — RIKTIG BACKEND ── */}
        {tab === 'generate' && activity && (
          <div className="p-6 flex gap-6">

            {/* Vänster: info + knapp */}
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                  <Sparkles size={13}/> Pollinations AI + Cloudinary
                </div>
                <p className="font-black text-slate-900 text-sm">{activity.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Genererar en äkta AI-bild via <span className="font-semibold">Pollinations Flux</span> baserat
                  på aktivitetsnamnet — inte en slumpmässig bild. Lagras i Cloudinary.
                </p>
              </div>

              {genError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle size={13} className="shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-bold mb-0.5">Fel vid generering</p>
                    <p>{genError}</p>
                    {genError.includes('Cloudinary') && (
                      <p className="mt-1 text-red-500">
                        Kontrollera att <code className="bg-red-100 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>,{' '}
                        <code className="bg-red-100 px-1 rounded">CLOUDINARY_API_KEY</code> och{' '}
                        <code className="bg-red-100 px-1 rounded">CLOUDINARY_API_SECRET</code> är satta i Vercel.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                {generating
                  ? <><Loader2 size={15} className="animate-spin"/> Genererar…</>
                  : genResult
                    ? <><RefreshCw size={15}/> Generera ny</>
                    : <><Sparkles size={15}/> Generera AI-bild</>}
              </button>

              {genResult && (
                <button
                  onClick={() => { onSelect(genResult.url); onClose(); }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition">
                  <Check size={15}/> Använd denna bild
                </button>
              )}
            </div>

            {/* Höger: förhandsvisning */}
            <div className="w-56 shrink-0">
              <div className="h-full min-h-[180px] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {generating ? (
                  <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                    <Loader2 size={28} className="animate-spin text-indigo-400"/>
                    <p className="text-xs font-semibold leading-relaxed">
                      Skapar unik bild för<br/>
                      <span className="text-indigo-600">"{activity.title}"</span>
                    </p>
                    <p className="text-[10px] text-slate-300">kan ta 10–20 sek</p>
                  </div>
                ) : genResult ? (
                  <img src={genResult.url} alt={activity.title}
                    className="w-full h-full object-cover block"/>
                ) : activity?.image ? (
                  <img src={activity.image} alt={activity.title}
                    className="w-full h-full object-cover block opacity-40"/>
                ) : (
                  <div className="text-slate-300 text-xs text-center p-4">
                    <Sparkles size={24} className="mx-auto mb-2 opacity-50"/>
                    Tryck generera för att skapa en bild
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
