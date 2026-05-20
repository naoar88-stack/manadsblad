import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Download, Share2, Cloud, PanelRightOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExport, PREVIEW_ELEMENT_ID } from '../hooks/useExport';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Sön','Mån','Tis','Ons','Tors','Fre','Lör'];
const LAYOUTS     = [
  { id: 'lively',  name: 'Lively',  desc: 'Färgblock & glad energi',    gradient: 'from-orange-400 to-rose-500'    },
  { id: 'nordic',  name: 'Nordic',  desc: 'Luftigt & minimalt',         gradient: 'from-slate-300 to-slate-500'    },
  { id: 'vibrant', name: 'Vibrant', desc: 'Runda & tydliga badges',     gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'gaming',  name: 'Gaming',  desc: 'Neon, mörkt & hög kontrast', gradient: 'from-cyan-400 to-indigo-500'   },
];
const FORMATS     = ['A4', 'A4 Liggande', 'IG Square', 'IG Story'];
const SCHEMES     = ['Per vecka', 'Pedagogiska färgkoder', 'Eget per kategori'];
const FONTS       = ['Inter', 'Poppins', 'Nunito', 'Montserrat', 'DM Sans'];
const BACKGROUNDS = ['Rutnät', 'Dots', 'Soft Glow', 'Ingen'];

const COMMUNITY_TEMPLATES = [
  { id: 1, title: 'Stockholm Neon',  author: 'Fryshuset Väst',     public: true,  layout: 'gaming',  uses: 143 },
  { id: 2, title: 'Trygg Höst',      author: 'Tensta Träff',       public: true,  layout: 'nordic',  uses: 88  },
  { id: 3, title: 'Lovspecial Juni', author: 'Ungdomshuset Nacka', public: false, layout: 'lively',  uses: 21  },
  { id: 4, title: 'Lokal Esport',    author: 'Mötesplats Rinkeby', public: true,  layout: 'vibrant', uses: 57  },
];

function formatDate(d) {
  return `${WEEKDAY_SV[d.getDay()]} ${d.getDate()} ${MONTH_SV[d.getMonth()].slice(0,3)}`;
}
function Section({ title, children }) {
  return <div className="mb-6"><h3 className="font-semibold text-slate-900 mb-3 text-sm">{title}</h3>{children}</div>;
}
function Tile({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition ${ active ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' }`}>{label}</button>
  );
}

export function StudioView({ activities, design, setDesign, settings, year, month, zoom, setZoom, onCrop, templates, addTemplate }) {
  const [showSide, setShowSide] = useState(true);

  const { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare } =
    useExport({ format: design.format, cloudEnabled: settings.cloudExport, yardName: settings.yardName });

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
    if (design.background === 'Rutnät')    return { backgroundImage: 'linear-gradient(rgba(99,102,241,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.07) 1px,transparent 1px)', backgroundSize: '22px 22px', opacity: op };
    if (design.background === 'Dots')      return { backgroundImage: 'radial-gradient(circle,rgba(79,70,229,.22) 1px,transparent 1px)', backgroundSize: '18px 18px', opacity: op };
    if (design.background === 'Soft Glow') return { background: 'radial-gradient(circle at top right,rgba(99,102,241,.3),transparent 30%),radial-gradient(circle at bottom left,rgba(244,114,182,.18),transparent 28%)', opacity: op };
    return {};
  }, [design]);

  const paperWidth = { 'A4': 700, 'A4 Liggande': 920, 'IG Square': 600, 'IG Story': 450 }[design.format] ?? 700;

  const update      = p => setDesign(prev => ({ ...prev, ...p }));
  const updateColor = (k, v) => setDesign(prev => ({ ...prev, colors: { ...prev.colors, [k]: v } }));

  return (
    <div className="max-w-screen-2xl mx-auto flex gap-5">

      {/* ——— PREVIEW ——— */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-4 lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live-förhandsgranskning</h2>
              <p className="text-sm text-slate-500">{design.format} · {LAYOUTS.find(l=>l.id===design.layout)?.name} · {design.font}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.45, +(z-0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomOut className="w-4 h-4" /></button>
              <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold min-w-[56px] text-center">{Math.round(zoom*100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.2, +(z+0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => setShowSide(s => !s)} className="lg:hidden h-10 px-3 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center gap-1.5">
                <PanelRightOpen className="w-4 h-4" />Verktyg
              </button>
            </div>
          </div>

          <div className="overflow-auto pb-6">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 150ms ease' }}>
              <div
                id={PREVIEW_ELEMENT_ID}
                className="relative mx-auto rounded-[28px] overflow-hidden"
                style={{ width: paperWidth, minHeight: 900, background: layoutTheme.pageBg, color: layoutTheme.text, fontFamily: design.font, border: '1px solid rgba(148,163,184,.18)', boxShadow: '0 32px 80px rgba(15,23,42,.18)' }}
              >
                <div className="absolute inset-0 pointer-events-none" style={bgStyle} />
                <div className="relative z-10 p-6">
                  {/* Header-banner */}
                  <div className="rounded-[24px] px-5 py-5 mb-5" style={{ background: layoutTheme.headerBg, border: `1px solid ${layoutTheme.accent}22` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: layoutTheme.muted }}>Månadsblad Pro</div>
                        <h1 className="text-[28px] font-extrabold leading-tight mb-2">{settings.yardName}</h1>
                        <p className="text-sm max-w-2xl" style={{ color: layoutTheme.muted }}>{MONTH_SV[month]} {year} · aktiviteter och ungdomskultur</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold mb-2" style={{ background: `${layoutTheme.accent}18`, color: layoutTheme.accent }}>{design.format}</div>
                        <div className="text-xs" style={{ color: layoutTheme.muted }}>{settings.qrLink.replace('https://','')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Masonry */}
                  <div style={{ columnCount: previewCols, columnGap: 18, padding: 4 }}>
                    {activities.map(a => (
                      <div key={a.id} className="group" style={{ display: 'inline-block', width: '100%', marginBottom: 18, borderRadius: 22, overflow: 'hidden', background: design.layout==='gaming'?'#0f172a':'#fff', border: '1px solid rgba(15,23,42,.06)', boxShadow: '0 8px 24px rgba(15,23,42,.07)' }}>
                        <div className="relative" style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                          <img src={a.image} alt={a.title} className="w-full h-full object-cover" style={{ objectPosition: `${a.crop.x}% ${a.crop.y}%`, transform: `scale(${a.crop.zoom})` }} />
                          <button onClick={() => onCrop(a.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-xl bg-white/90 text-xs font-semibold text-slate-900">Justera</button>
                          <div className="absolute left-3 bottom-3 flex gap-2 flex-wrap">
                            {a.badges.signup && <span style={{ padding:'3px 10px', borderRadius:999, background:'rgba(255,255,255,.92)', fontSize:11, fontWeight:700, color:'#0f172a' }}>Anmälan</span>}
                            {a.badges.cost   && <span style={{ padding:'3px 10px', borderRadius:999, background:'#f59e0b', fontSize:11, fontWeight:700, color:'#fff' }}>Kostnad</span>}
                            {a.badges.trip   && <span style={{ padding:'3px 10px', borderRadius:999, background:'#16a34a', fontSize:11, fontWeight:700, color:'#fff' }}>Utflykt</span>}
                          </div>
                        </div>
                        <div style={{ padding:'14px 16px', background: design.layout==='gaming'?'#0f172a':'#fff' }}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color: layoutTheme.accent }}>{formatDate(a.date)}</span>
                            <span style={{ fontSize:10, padding:'3px 8px', borderRadius:999, background: design.layout==='gaming'?'#1e293b':'#f1f5f9', color: layoutTheme.muted }}>{a.ageGroup}</span>
                          </div>
                          <div style={{ fontSize:16, fontWeight:800, marginBottom:6, lineHeight:1.3, color: layoutTheme.text }}>{a.title}</div>
                          <div style={{ fontSize:12, lineHeight:1.7, color: layoutTheme.muted }}>{a.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize:11, color: layoutTheme.muted, padding:'8px 4px 4px' }}>
                    {settings.footerText}{settings.showStockholmLogo ? ' · Stockholm Stad' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ——— SIDE PANEL ——— */}
      <div className={`shrink-0 w-[360px] space-y-4 ${ showSide ? 'block' : 'hidden lg:block' }`}>

        {/* Community */}
        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Community Mallar</h3>
            <button onClick={() => addTemplate?.({ title: 'Min design', layout: design.layout, public: false })} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Spara min design</button>
          </div>
          <div className="space-y-3">
            {COMMUNITY_TEMPLATES.map(t => (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div><div className="font-semibold text-sm">{t.title}</div><div className="text-xs text-slate-500 mt-0.5">{t.author} · {t.layout}</div></div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${ t.public ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600' }`}>{t.public ? 'Publik' : 'Privat'}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-xs text-slate-400">{t.uses} nedladdningar</span>
                  <button onClick={() => update({ layout: t.layout })} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">Ladda</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layout + Format + Färg + Typsnitt */}
        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-5">
          <Section title="Layout">
            <div className="grid grid-cols-2 gap-3">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => update({ layout: l.id })} className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${ design.layout===l.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50' }`}>
                  <div className={`h-14 rounded-xl bg-gradient-to-br ${l.gradient} mb-2.5`} />
                  <div className="font-semibold text-sm">{l.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Pappersformat">
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(f => <Tile key={f} label={f} active={design.format===f} onClick={() => update({ format: f })} />)}
            </div>
          </Section>

          <Section title="Färgsystem">
            <div className="space-y-2">
              {SCHEMES.map(s => <Tile key={s} label={s} active={design.colorScheme===s} onClick={() => update({ colorScheme: s })} />)}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(design.colors).map(([k, v]) => (
                <label key={k} className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="mb-1.5 capitalize font-medium">{k}</div>
                  <input type="color" value={v} onChange={e => updateColor(k, e.target.value)} className="w-full h-9 rounded-xl border border-slate-200" />
                </label>
              ))}
            </div>
          </Section>

          <Section title="Typsnitt & bakgrund">
            <div className="space-y-3">
              <select value={design.font} onChange={e => update({ font: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                {FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
              <select value={design.background} onChange={e => update({ background: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                {BACKGROUNDS.map(b => <option key={b}>{b}</option>)}
              </select>
              <label className="block text-xs text-slate-500">Bakgrundsopacity: {design.backgroundOpacity}%
                <input type="range" min="0" max="100" value={design.backgroundOpacity} onChange={e => update({ backgroundOpacity: Number(e.target.value) })} className="w-full mt-1.5" />
              </label>
              <input placeholder="Bakgrundsbild URL" value={design.backgroundImage} onChange={e => update({ backgroundImage: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
            </div>
          </Section>

          {/* Export */}
          <Section title="Export & delning">
            {exportError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />{exportError}
              </div>
            )}
            {exportSuccess && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />{exportSuccess}
              </div>
            )}
            <div className="space-y-2">
              <button onClick={cloudExport} disabled={exporting} className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}Moln-export (PDF)
              </button>
              <button onClick={downloadPDF} disabled={exporting} className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Lokal PDF
              </button>
              <button onClick={downloadPNG} disabled={exporting} className="w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Spara som PNG
              </button>
              <button onClick={webShare} disabled={exporting} className="w-full py-3 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}Dela via Web Share
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">Zoom återställs automatiskt till 100 % vid export.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
