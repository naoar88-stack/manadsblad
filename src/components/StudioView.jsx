import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Download, Share2, Cloud, PanelRightOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExport, PREVIEW_ELEMENT_ID } from '../hooks/useExport';

const MONTH_SV = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV = ['Son','Man','Tis','Ons','Tors','Fre','Lor'];
const LAYOUTS = [
  { id: 'lively',  name: 'Lively',  desc: 'Fargblock & glad energi',   gradient: 'from-orange-400 to-rose-500' },
  { id: 'nordic',  name: 'Nordic',  desc: 'Luftigt & minimalt',       gradient: 'from-slate-300 to-slate-500' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Runda & tydliga badges',   gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'gaming',  name: 'Gaming',  desc: 'Neon, morkt & hog kontrast', gradient: 'from-cyan-400 to-indigo-500' },
];
const FORMATS = ['A4', 'A4 Liggande', 'IG Square', 'IG Story'];
const SCHEMES = ['Per vecka', 'Pedagogiska fargkoder', 'Eget per kategori'];
const FONTS = ['Inter', 'Poppins', 'Nunito', 'Montserrat', 'DM Sans'];
const BACKGROUNDS = ['Rutnat', 'Dots', 'Soft Glow', 'Ingen'];

const COMMUNITY_TEMPLATES = [
  { id: 1, title: 'Stockholm Neon', author: 'Fryshuset Vast', public: true, layout: 'gaming', uses: 143 },
  { id: 2, title: 'Trygg Host', author: 'Tensta Traff', public: true, layout: 'nordic', uses: 88 },
  { id: 3, title: 'Lovspecial Juni', author: 'Ungdomshuset Nacka', public: false, layout: 'lively', uses: 21 },
  { id: 4, title: 'Lokal Esport', author: 'Motesplats Rinkeby', public: true, layout: 'vibrant', uses: 57 },
];

// Robust datum-hantering - fungerar med Date-objekt OCH ISO-strangar
function toDate(d) {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  return new Date(d); // ISO-strang
}

function formatDate(d) {
  const date = toDate(d);
  return `${WEEKDAY_SV[date.getDay()]} ${date.getDate()} ${MONTH_SV[date.getMonth()].slice(0,3)}`;
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Tile({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

export function StudioView({
  activities,
  design,
  setDesign,
  settings,
  year,
  month,
  zoom,
  setZoom,
  onCrop,
  templates,
  addTemplate
}) {
  const [showSide, setShowSide] = useState(true);
  const { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare } = useExport({
    format: design.format,
    cloudEnabled: settings.cloudExport,
    yardName: settings.yardName
  });

  const previewCols = useMemo(() => design.format === 'A4 Liggande' ? 3 : 2, [design.format]);

  const layoutTheme = useMemo(() => ({
    lively:  { pageBg: 'linear-gradient(180deg,#fff7ed 0%,#fff 22%)', headerBg: '#fff1e6', accent: '#ea580c', text: '#0f172a', muted: '#64748b' },
    nordic:  { pageBg: 'linear-gradient(180deg,#f8fafc 0%,#fff 18%)', headerBg: '#f1f5f9', accent: '#334155', text: '#0f172a', muted: '#64748b' },
    vibrant: { pageBg: 'linear-gradient(180deg,#fdf4ff 0%,#fff 18%)', headerBg: '#fae8ff', accent: '#a21caf', text: '#0f172a', muted: '#64748b' },
    gaming:  { pageBg: 'linear-gradient(180deg,#111827 0%,#1f2937 40%,#111827 100%)', headerBg: '#172554', accent: '#22d3ee', text: '#f8fafc', muted: '#94a3b8' },
  }[design.layout]), [design.layout]);

  const bgStyle = useMemo(() => {
    const op = design.backgroundOpacity / 100;
    if (design.backgroundImage) return { backgroundImage: `url(${design.backgroundImage})`, backgroundSize: 'cover', opacity: op };
    if (design.background === 'Rutnat') return {
      backgroundImage: 'linear-gradient(rgba(99,102,241,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.07) 1px,transparent 1px)',
      backgroundSize: '22px 22px',
      opacity: op
    };
    if (design.background === 'Dots') return {
      backgroundImage: 'radial-gradient(circle,rgba(79,70,229,.22) 1px,transparent 1px)',
      backgroundSize: '18px 18px',
      opacity: op
    };
    if (design.background === 'Soft Glow') return {
      background: 'radial-gradient(circle at top right,rgba(99,102,241,.3),transparent 30%),radial-gradient(circle at bottom left,rgba(244,114,182,.18),transparent 28%)',
      opacity: op
    };
    return {};
  }, [design]);

  const paperWidth = { 'A4': 700, 'A4 Liggande': 920, 'IG Square': 600, 'IG Story': 450 }[design.format] ?? 700;

  const update = p => setDesign(prev => ({ ...prev, ...p }));
  const updateColor = (k, v) => setDesign(prev => ({ ...prev, colors: { ...prev.colors, [k]: v } }));

  return (
    <div className="flex">
      {/* PREVIEW */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live-forhandsgranskning</h2>
            <p className="text-sm text-slate-500">{design.format} · {LAYOUTS.find(l=>l.id===design.layout)?.name} · {design.font}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.45, +(z-0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-sm font-semibold text-slate-700 w-12 text-center">{Math.round(zoom*100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.2, +(z+0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setShowSide(s => !s)} className="lg:hidden h-10 px-3 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center gap-1.5"><PanelRightOpen className="w-4 h-4" />Verktyg</button>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            id={PREVIEW_ELEMENT_ID}
            style={{ width: paperWidth, transform: `scale(${zoom})`, transformOrigin: 'top center', fontFamily: design.font, background: layoutTheme.pageBg, color: layoutTheme.text }}
            className="bg-white shadow-2xl rounded-xl overflow-hidden mb-8"
          >
            {/* Header */}
            <div style={{ background: layoutTheme.headerBg }} className="px-8 py-6 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Manadsblad Pro</div>
              <h1 className="text-3xl font-black" style={{ color: layoutTheme.accent }}>{settings.yardName}</h1>
              <p className="text-sm mt-1" style={{ color: layoutTheme.muted }}>{MONTH_SV[month]} {year} · aktiviteter och ungdomskultur</p>
            </div>

            {/* QR */}
            <div className="absolute top-6 right-8 text-right">
              <div className="w-16 h-16 bg-slate-900 rounded-lg mb-1"></div>
              <div className="text-[9px] font-medium text-slate-500">{design.format}</div>
              <div className="text-[8px] text-slate-400">{settings.qrLink.replace('https://','')}</div>
            </div>

            {/* Masonry grid */}
            <div className={`px-8 py-6 grid gap-5`} style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}>
              {activities.map(a => (
                <div key={a.id} className="group/card bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                  {/* Bild */}
                  {a.image && (
                    <div className="relative w-full h-40 overflow-hidden bg-slate-100">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${a.crop?.x ?? 50}% ${a.crop?.y ?? 50}%`,
                          transform: `scale(${a.crop?.zoom ?? 1})`,
                        }}
                      />
                      <button
                        onClick={() => onCrop?.(a.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition px-3 py-1.5 rounded-xl bg-white/90 text-xs font-semibold text-slate-900"
                      >
                        Justera
                      </button>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                    {a.badges?.signup && <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Anmalan</span>}
                    {a.badges?.cost && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold">Kostnad</span>}
                    {a.badges?.trip && <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Utflykt</span>}
                  </div>

                  {/* Meta */}
                  <div className="px-4 py-2 flex items-center gap-2 text-[11px]" style={{ color: layoutTheme.muted }}>
                    <span className="font-semibold">{formatDate(a.date)}</span>
                    <span>·</span>
                    <span>{a.ageGroup}</span>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4">
                    <h3 className="font-bold text-base mb-1" style={{ color: layoutTheme.text }}>{a.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: layoutTheme.muted }}>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-200 text-center text-xs" style={{ color: layoutTheme.muted }}>
              {settings.footerText}{settings.showStockholmLogo ? ' · Stockholm Stad' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto ${ showSide ? '' : 'hidden lg:block' }`}>
        {/* Community */}
        <Section title="Community Mallar">
          <button onClick={() => addTemplate?.({ title: 'Min design', layout: design.layout, public: false })} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Spara min design</button>
          <div className="mt-3 space-y-2">
            {COMMUNITY_TEMPLATES.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-sm text-slate-900">{t.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.author} · {t.layout}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{t.public ? 'Publik' : 'Privat'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{t.uses} nedladdningar</span>
                    <button onClick={() => update({ layout: t.layout })} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">Ladda</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout">
          <div className="grid grid-cols-2 gap-2">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => update({ layout: l.id })}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                  design.layout===l.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`h-8 rounded-lg bg-gradient-to-r ${l.gradient} mb-2`}></div>
                <div className="font-semibold text-xs text-slate-900">{l.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Format + Farg + Font */}
        <Section title="Format"><div className="flex flex-wrap gap-2">{FORMATS.map(f => <Tile key={f} label={f} active={design.format===f} onClick={() => update({ format: f })} />)}</div></Section>
        <Section title="Fargschema"><div className="flex flex-wrap gap-2">{SCHEMES.map(s => <Tile key={s} label={s} active={design.colorScheme===s} onClick={() => update({ colorScheme: s })} />)}</div></Section>
        <Section title="Veckofarger">
          {Object.entries(design.colors).map(([k, v]) => (<div key={k} className="flex items-center gap-2 mb-2"><span className="text-xs text-slate-600 w-16">{k}</span><input type="color" value={v} onChange={e => updateColor(k, e.target.value)} className="w-full h-9 rounded-xl border border-slate-200" /></div>))}
        </Section>
        <Section title="Typsnitt"><select value={design.font} onChange={e => update({ font: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">{FONTS.map(f => <option key={f}>{f}</option>)}</select></Section>
        <Section title="Bakgrund">
          <select value={design.background} onChange={e => update({ background: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">{BACKGROUNDS.map(b => <option key={b}>{b}</option>)}</select>
          <div className="mt-3"><label className="text-xs text-slate-600">Bakgrundsopacity: {design.backgroundOpacity}%</label><input type="range" min="0" max="100" value={design.backgroundOpacity} onChange={e => update({ backgroundOpacity: Number(e.target.value) })} className="w-full mt-1.5" /></div>
          <input placeholder="Bakgrundsbild URL" value={design.backgroundImage} onChange={e => update({ backgroundImage: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none mt-3" />
        </Section>

        {/* Export */}
        <Section title="Exportera">
          {exportError && (<div className="mb-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{exportError}</div>)}
          {exportSuccess && (<div className="mb-3 p-3 rounded-xl bg-green-50 text-green-700 text-xs flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{exportSuccess}</div>)}
          <div className="space-y-2">
            <button onClick={cloudExport} disabled={exporting} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2">{exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}Moln-export (PDF)</button>
            <button onClick={downloadPDF} disabled={exporting} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2">{exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Lokal PDF</button>
            <button onClick={downloadPNG} disabled={exporting} className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2">{exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Spara som PNG</button>
            <button onClick={webShare} disabled={exporting} className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2">{exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}Dela via Web Share</button>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Zoom aterstalls automatiskt till 100 % vid export.</p>
        </Section>
      </div>
    </div>
  );
}
