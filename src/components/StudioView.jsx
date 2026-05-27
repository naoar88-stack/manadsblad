import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Download, Share2, Cloud, PanelRightOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExport, PREVIEW_ELEMENT_ID } from '../hooks/useExport';

const MONTH_SV = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV = ['Son','Man','Tis','Ons','Tors','Fre','Lor'];
const WEEKDAY_FULL = ['Sondag','Mandag','Tisdag','Onsdag','Torsdag','Fredag','Lordag'];

const LAYOUTS = [
  { id: 'lively',  name: 'Lively',  desc: 'Fargblock & glad energi',       gradient: 'from-orange-400 to-rose-500'    },
  { id: 'nordic',  name: 'Nordic',  desc: 'Luftigt & minimalt',             gradient: 'from-slate-300 to-slate-500'    },
  { id: 'vibrant', name: 'Vibrant', desc: 'Runda & tydliga badges',         gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'gaming',  name: 'Gaming',  desc: 'Neon, morkt & hog kontrast',     gradient: 'from-cyan-400 to-indigo-500'    },
];
const FORMATS     = ['A4', 'A4 Liggande', 'IG Square', 'IG Story'];
const SCHEMES     = ['Per vecka', 'Pedagogiska fargkoder', 'Eget per kategori'];
const FONTS       = ['Inter', 'Poppins', 'Nunito', 'Montserrat', 'DM Sans'];
const BACKGROUNDS = ['Rutnat', 'Dots', 'Soft Glow', 'Ingen'];
const WEEK_COLORS = ['#4f46e5','#0ea5e9','#22c55e','#f97316','#e11d48','#7c3aed'];

const COMMUNITY_TEMPLATES = [
  { id: 1, title: 'Stockholm Neon',    author: 'Fryshuset Vast',         public: true,  layout: 'gaming',   uses: 143 },
  { id: 2, title: 'Trygg Host',        author: 'Tensta Traff',           public: true,  layout: 'nordic',   uses: 88  },
  { id: 3, title: 'Lovspecial Juni',   author: 'Ungdomshuset Nacka',     public: false, layout: 'lively',   uses: 21  },
  { id: 4, title: 'Lokal Esport',      author: 'Motesplats Rinkeby',     public: true,  layout: 'vibrant',  uses: 57  },
];

function toDate(d) {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  return new Date(d);
}
function getWeekNumber(d) {
  const date = toDate(d);
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}
function formatDate(d) {
  const date = toDate(d);
  return `${WEEKDAY_SV[date.getDay()]} ${date.getDate()} ${MONTH_SV[date.getMonth()].slice(0,3)}`;
}
function formatDayHeader(d) {
  const date = toDate(d);
  const wd = WEEKDAY_FULL[date.getDay()];
  return `${wd.toUpperCase()} ${date.getDate()}/${date.getMonth()+1}`;
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}
function Tile({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function WeeklyLayout({ activities, design, settings, year, month, layoutTheme, onCrop }) {
  const weekColors = design.colors || { week1:'#4f46e5', week2:'#0ea5e9', week3:'#22c55e', week4:'#f97316' };

  const weeks = useMemo(() => {
    const map = new Map();
    activities.forEach(a => {
      const d = toDate(a.date);
      const wnum = getWeekNumber(d);
      if (!map.has(wnum)) map.set(wnum, { wnum, days: new Map() });
      const dayKey = d.toISOString().slice(0,10);
      const week = map.get(wnum);
      if (!week.days.has(dayKey)) week.days.set(dayKey, { date: d, activities: [] });
      week.days.get(dayKey).activities.push(a);
    });
    return [...map.values()].sort((a,b) => a.wnum - b.wnum);
  }, [activities]);

  const weekColorList = [weekColors.week1, weekColors.week2, weekColors.week3, weekColors.week4];

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {weeks.map((week, wi) => {
        const color = weekColorList[wi % weekColorList.length];
        const days = [...week.days.values()].sort((a,b) => a.date - b.date);
        return (
          <div key={week.wnum} style={{ border: `2px solid ${color}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: color, color: '#fff', fontWeight: 700, fontSize: 13, padding: '5px 12px', letterSpacing: '0.05em' }}>
              Vecka {week.wnum}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length || 1}, 1fr)`, gap: 0 }}>
              {days.map(day => (
                <div key={day.date.toISOString()} style={{ borderRight: `1px solid ${color}22`, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 6, letterSpacing: '0.04em' }}>
                    {formatDayHeader(day.date)}
                  </div>
                  {day.activities.map(a => (
                    <div key={a.id} style={{
                      background: '#fff', borderRadius: 8,
                      boxShadow: `0 1px 6px ${color}33`, marginBottom: 6,
                      overflow: 'hidden', border: `1px solid ${color}22`,
                    }}>
                      {a.image && (
                        <img src={a.image} alt={a.title} style={{ width: '100%', height: 52, objectFit: 'cover' }} />
                      )}
                      <div style={{ padding: '5px 7px' }}>
                        <div style={{ fontWeight: 700, fontSize: 11, color, lineHeight: 1.3 }}>{a.title}</div>
                        {a.description && (
                          <div style={{ fontSize: 9, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{a.description}</div>
                        )}
                        {(a.badges?.signup || a.badges?.cost || a.badges?.trip) && (
                          <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                            {a.badges?.signup && <span style={{ fontSize: 8, background: '#fef9c3', color: '#854d0e', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Anmälan</span>}
                            {a.badges?.cost   && <span style={{ fontSize: 8, background: '#dcfce7', color: '#166534', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Kostnad</span>}
                            {a.badges?.trip   && <span style={{ fontSize: 8, background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Utflykt</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {day.activities.length === 0 && (
                    <div style={{ fontSize: 10, color: '#cbd5e1', textAlign: 'center', paddingTop: 8 }}>—</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GridLayout({ activities, design, settings, layoutTheme, previewCols, onCrop }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
      gap: 10,
      padding: '10px 14px',
    }}>
      {activities.map(a => (
        <div key={a.id} className="group/card" style={{
          background: '#fff', borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {a.image && (
            <div style={{ position: 'relative' }}>
              <img src={a.image} alt={a.title} style={{ width: '100%', height: 72, objectFit: 'cover' }} />
              <button onClick={() => onCrop?.(a.id)} className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition px-2 py-1 rounded-lg bg-white/90 text-xs font-semibold text-slate-900">
                Justera
              </button>
            </div>
          )}
          <div style={{ padding: '7px 9px' }}>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 3 }}>
              {a.badges?.signup && <span style={{ fontSize: 8, background: '#fef9c3', color: '#854d0e', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Anmälan</span>}
              {a.badges?.cost   && <span style={{ fontSize: 8, background: '#dcfce7', color: '#166534', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Kostnad</span>}
              {a.badges?.trip   && <span style={{ fontSize: 8, background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '1px 4px', fontWeight: 600 }}>Utflykt</span>}
            </div>
            <div style={{ fontSize: 9, color: layoutTheme.muted, marginBottom: 2 }}>
              {formatDate(a.date)} · {a.ageGroup}
            </div>
            <div style={{ fontWeight: 700, fontSize: 11, color: layoutTheme.text, lineHeight: 1.3 }}>{a.title}</div>
            <div style={{ fontSize: 9, color: layoutTheme.muted, marginTop: 2, lineHeight: 1.4 }}>{a.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudioView({ activities, design, setDesign, settings, year, month, zoom, setZoom, onCrop, templates, addTemplate }) {
  const [showSide, setShowSide] = useState(true);

  const { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare } = useExport({
    format: design.format,
    cloudEnabled: settings.cloudExport,
    yardName: settings.yardName,
  });

  const previewCols = useMemo(() => design.format === 'A4 Liggande' ? 3 : 2, [design.format]);

  const layoutTheme = useMemo(() => ({
    lively:  { pageBg: 'linear-gradient(180deg,#fff7ed 0%,#fff 22%)', headerBg: '#fff1e6', accent: '#ea580c', text: '#0f172a', muted: '#64748b' },
    nordic:  { pageBg: 'linear-gradient(180deg,#f8fafc 0%,#fff 18%)', headerBg: '#f1f5f9', accent: '#334155', text: '#0f172a', muted: '#64748b' },
    vibrant: { pageBg: 'linear-gradient(180deg,#fdf4ff 0%,#fff 18%)', headerBg: '#fae8ff', accent: '#a21caf', text: '#0f172a', muted: '#64748b' },
    gaming:  { pageBg: 'linear-gradient(180deg,#111827 0%,#1f2937 40%,#111827 100%)', headerBg: '#172554', accent: '#22d3ee', text: '#f8fafc', muted: '#94a3b8' },
  }[design.layout]), [design.layout]);

  const paperWidth  = { 'A4': 700, 'A4 Liggande': 920, 'IG Square': 600, 'IG Story': 450 }[design.format] ?? 700;
  const paperHeight = design.format === 'A4 Liggande' ? 540 : 990;

  const update      = p => setDesign(prev => ({ ...prev, ...p }));
  const updateColor = (k, v) => setDesign(prev => ({ ...prev, colors: { ...prev.colors, [k]: v } }));

  const isWeekly = settings.groupWeeks;

  // ── AUTO-SCALE: passa allt innehåll på en sida ──
  const contentRef = useRef(null);
  const [contentScale, setContentScale] = useState(1);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setContentScale(1); // återställ innan mätning
    const frame = requestAnimationFrame(() => {
      const available = el.clientHeight;
      const actual    = el.scrollHeight;
      if (actual > available && available > 0) {
        setContentScale(Math.max(0.3, available / actual));
      } else {
        setContentScale(1);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [activities, design, isWeekly, paperHeight, paperWidth]);

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-slate-100">

      {/* ── PREVIEW ── */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live-förhandsgranskning</h2>
            <p className="text-xs text-slate-400">{design.format} · {LAYOUTS.find(l => l.id === design.layout)?.name} · {design.font}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.35, +(z - 0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomOut size={16} /></button>
            <span className="text-sm font-semibold text-slate-700 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.2, +(z + 0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomIn size={16} /></button>
            <button onClick={() => setShowSide(s => !s)} className="lg:hidden h-10 px-3 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center gap-1.5"><PanelRightOpen size={15} />Verktyg</button>
          </div>
        </div>

        {/* PAPPERSSIDA */}
        <div
          id={PREVIEW_ELEMENT_ID}
          style={{
            width:           paperWidth,
            height:          paperHeight,
            background:      layoutTheme.pageBg,
            fontFamily:      design.font,
            transform:       `scale(${zoom})`,
            transformOrigin: 'top center',
            overflow:        'hidden',
            display:         'flex',
            flexDirection:   'column',
            position:        'relative',
            flexShrink:      0,
            boxShadow:       '0 8px 40px rgba(0,0,0,0.15)',
            borderRadius:    8,
          }}
        >
          {/* HEADER */}
          <div style={{
            background:     layoutTheme.headerBg,
            padding:        '14px 20px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexShrink:     0,
            borderBottom:   `2px solid ${layoutTheme.accent}22`,
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: layoutTheme.accent, textTransform: 'uppercase' }}>FRITIDSGÅRD</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: layoutTheme.text, lineHeight: 1.1 }}>{settings.yardName}</div>
              <div style={{ fontSize: 10, color: layoutTheme.muted, marginTop: 2 }}>{MONTH_SV[month]} {year} · aktiviteter och ungdomskultur</div>
            </div>
            {settings.yardLogo ? (
              <img src={settings.yardLogo} alt="Logotyp" style={{ height: 48, maxWidth: 120, objectFit: 'contain', borderRadius: 6 }} loading="lazy" />
            ) : (
              <div style={{ fontSize: 9, color: layoutTheme.muted, textAlign: 'center', maxWidth: 100 }}>Ladda upp logotyp i Inställningar</div>
            )}
          </div>

          {/* INNEHÅLL — skalas automatiskt för att passa en sida */}
          <div
            ref={contentRef}
            style={{
              flex:          1,
              minHeight:     0,
              overflow:      'hidden',
              display:       'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              transform:       `scale(${contentScale})`,
              transformOrigin: 'top left',
              width:           contentScale < 1 ? `${100 / contentScale}%` : '100%',
            }}>
              {isWeekly ? (
                <WeeklyLayout
                  activities={activities}
                  design={design}
                  settings={settings}
                  year={year}
                  month={month}
                  layoutTheme={layoutTheme}
                  onCrop={onCrop}
                />
              ) : (
                <GridLayout
                  activities={activities}
                  design={design}
                  settings={settings}
                  layoutTheme={layoutTheme}
                  previewCols={previewCols}
                  onCrop={onCrop}
                />
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            background:     layoutTheme.headerBg,
            padding:        '8px 20px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexShrink:     0,
            borderTop:      `1px solid ${layoutTheme.accent}22`,
          }}>
            <span style={{ fontSize: 9, color: layoutTheme.muted }}>{settings.footerText}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {settings.showStockholmLogo && (
                <span style={{ fontSize: 8, fontWeight: 700, color: layoutTheme.muted, letterSpacing: '0.1em' }}>STOCKHOLM STAD</span>
              )}
              <div style={{
                background:   layoutTheme.accent,
                borderRadius: 6,
                padding:      '4px 8px',
                display:      'flex',
                alignItems:   'center',
                gap:          4,
              }}>
                <div style={{ width: 20, height: 20, background: '#fff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: layoutTheme.accent }}>QR</div>
                <span style={{ fontSize: 8, color: '#fff', fontWeight: 600 }}>{(settings.qrLink || '').replace('https://','').slice(0,22)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      {showSide && (
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto pb-12">

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Exportera">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadPNG} disabled={exporting} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}PNG
                </button>
                <button onClick={downloadPDF} disabled={exporting} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
                  <Download size={14} />PDF
                </button>
                <button onClick={cloudExport} disabled={exporting} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">
                  <Cloud size={14} />Moln
                </button>
                <button onClick={webShare}    disabled={exporting} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">
                  <Share2 size={14} />Dela
                </button>
              </div>
              {exportError   && <div className="mt-2 text-xs text-rose-500 flex gap-1"><AlertCircle size={12}/>{exportError}</div>}
              {exportSuccess && <div className="mt-2 text-xs text-emerald-600 flex gap-1"><CheckCircle2 size={12}/>{exportSuccess}</div>}
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Community-mallar">
              <button onClick={() => addTemplate?.({ title: 'Min design', layout: design.layout, public: false })} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium mb-3 block">
                Spara min design
              </button>
              <div className="flex flex-col gap-2">
                {COMMUNITY_TEMPLATES.map(t => (
                  <div key={t.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="font-semibold text-sm text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-400">{t.author} · {t.layout}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.public ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {t.public ? 'Publik' : 'Privat'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{t.uses} nedladdningar</span>
                        <button onClick={() => update({ layout: t.layout })} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">Ladda</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Layout">
              <div className="grid grid-cols-2 gap-2">
                {LAYOUTS.map(l => (
                  <button key={l.id} onClick={() => update({ layout: l.id })} className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${design.layout === l.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className={`h-8 rounded-lg bg-gradient-to-br ${l.gradient} mb-2`} />
                    <div className="text-sm font-semibold text-slate-900">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.desc}</div>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Format">
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(f => <Tile key={f} label={f} active={design.format === f} onClick={() => update({ format: f })} />)}
              </div>
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Typsnitt">
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => <Tile key={f} label={f} active={design.font === f} onClick={() => update({ font: f })} />)}
              </div>
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Bakgrund">
              <div className="flex flex-wrap gap-2 mb-3">
                {BACKGROUNDS.map(b => <Tile key={b} label={b} active={design.background === b} onClick={() => update({ background: b })} />)}
              </div>
              <label className="text-xs text-slate-500 mb-1 block">Genomskinlighet: {design.backgroundOpacity}%</label>
              <input type="range" min="5" max="60" value={design.backgroundOpacity} onChange={e => update({ backgroundOpacity: +e.target.value })} className="w-full" />
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Färgschema">
              <div className="flex flex-wrap gap-2 mb-3">
                {SCHEMES.map(s => <Tile key={s} label={s} active={design.colorScheme === s} onClick={() => update({ colorScheme: s })} />)}
              </div>
              {design.colorScheme === 'Per vecka' && (
                <div className="flex gap-2 flex-wrap">
                  {['week1','week2','week3','week4'].map((k, i) => (
                    <div key={k} className="flex flex-col items-center gap-1">
                      <input type="color" value={design.colors?.[k] ?? WEEK_COLORS[i]} onChange={e => updateColor(k, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                      <span className="text-xs text-slate-400">V{i+1}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Section title="Bakgrundsbild">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 transition">
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update({ backgroundImage: ev.target?.result });
                  reader.readAsDataURL(file);
                }} />
                <span className="text-sm text-slate-600">Ladda upp bakgrundsbild</span>
              </label>
              {design.backgroundImage && (
                <button onClick={() => update({ backgroundImage: '' })} className="mt-2 text-xs text-rose-500 hover:text-rose-700">
                  Ta bort bakgrundsbild
                </button>
              )}
            </Section>
          </div>

        </div>
      )}
    </div>
  );
}
