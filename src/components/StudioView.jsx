import React, { useState, useMemo, useRef } from 'react';
import { ZoomIn, ZoomOut, Download, Share2, Cloud, PanelRightOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExport, PREVIEW_ELEMENT_ID } from '../hooks/useExport';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Son','Man','Tis','Ons','Tors','Fre','Lor'];
const WEEKDAY_FULL = ['Sondag','Mandag','Tisdag','Onsdag','Torsdag','Fredag','Lordag'];
const LAYOUTS = [
  { id: 'lively',  name: 'Lively',  desc: 'Fargblock & glad energi',      gradient: 'from-orange-400 to-rose-500' },
  { id: 'nordic',  name: 'Nordic',  desc: 'Luftigt & minimalt',            gradient: 'from-slate-300 to-slate-500' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Runda & tydliga badges',        gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'gaming',  name: 'Gaming',  desc: 'Neon, morkt & hog kontrast',    gradient: 'from-cyan-400 to-indigo-500' },
];
const FORMATS    = ['A4', 'A4 Liggande', 'IG Square', 'IG Story'];
const SCHEMES    = ['Per vecka', 'Pedagogiska fargkoder', 'Eget per kategori'];
const FONTS      = ['Inter', 'Poppins', 'Nunito', 'Montserrat', 'DM Sans'];
const BACKGROUNDS = ['Rutnat', 'Dots', 'Soft Glow', 'Ingen'];
const WEEK_COLORS = ['#4f46e5','#0ea5e9','#22c55e','#f97316','#e11d48','#7c3aed'];

const COMMUNITY_TEMPLATES = [
  { id: 1, title: 'Stockholm Neon',    author: 'Fryshuset Vast',        public: true,  layout: 'gaming',   uses: 143 },
  { id: 2, title: 'Trygg Host',        author: 'Tensta Traff',           public: true,  layout: 'nordic',   uses: 88  },
  { id: 3, title: 'Lovspecial Juni',   author: 'Ungdomshuset Nacka',    public: false, layout: 'lively',   uses: 21  },
  { id: 4, title: 'Lokal Esport',      author: 'Motesplats Rinkeby',    public: true,  layout: 'vibrant',  uses: 57  },
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
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Tile({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}>
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
   VECKOVY — ser ut som referensbilden med Vecka-rubrik +
   dag-kolumner (Ons / Tors / Fre) och aktivitetskort i varje.
──────────────────────────────────────────────────────────── */
function WeeklyLayout({ activities, design, settings, year, month, layoutTheme, onCrop }) {
  const openDays   = [3, 4, 5]; // Ons=3, Tors=4, Fre=5
  const weekColors = design.colors || { week1:'#4f46e5', week2:'#0ea5e9', week3:'#22c55e', week4:'#f97316' };

  // Bygg veckogrupperingar
  const weeks = useMemo(() => {
    const map = new Map();
    activities.forEach(a => {
      const d    = toDate(a.date);
      const wnum = getWeekNumber(d);
      if (!map.has(wnum)) map.set(wnum, { wnum, days: new Map() });
      const dayKey = d.toISOString().slice(0,10);
      const week   = map.get(wnum);
      if (!week.days.has(dayKey)) week.days.set(dayKey, { date: d, activities: [] });
      week.days.get(dayKey).activities.push(a);
    });
    return [...map.values()].sort((a,b) => a.wnum - b.wnum);
  }, [activities]);

  // Unika dagar per vecka (max 3 — öppna dagar)
  const weekColorList = [weekColors.week1, weekColors.week2, weekColors.week3, weekColors.week4];

  const accentBg = layoutTheme.headerBg;

  return (
    <div style={{ fontFamily: design.font }} className="px-6 pt-4 pb-6">
      {weeks.map((week, wi) => {
        const color = weekColorList[wi % weekColorList.length];
        const days  = [...week.days.values()].sort((a,b) => a.date - b.date);

        return (
          <div key={week.wnum} style={{ marginBottom: 12 }}>
            {/* Veckorubrik */}
            <div style={{
              background: color, color: '#fff',
              borderRadius: 8, padding: '4px 14px', marginBottom: 6,
              fontWeight: 800, fontSize: 13, letterSpacing: '0.04em',
              textAlign: 'center'
            }}>
              Vecka {week.wnum}
            </div>

            {/* Dag-kolumner */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 6 }}>
              {days.map(day => (
                <div key={day.date.toISOString()}>
                  {/* Dag-header */}
                  <div style={{
                    background: layoutTheme.headerBg,
                    borderBottom: `2px solid ${color}`,
                    borderRadius: '6px 6px 0 0',
                    padding: '3px 8px',
                    fontSize: 10, fontWeight: 700,
                    color: layoutTheme.text,
                    textAlign: 'center'
                  }}>
                    {formatDayHeader(day.date)}
                  </div>

                  {/* Aktivitetskort i denna dag */}
                  {day.activities.map(a => (
                    <div key={a.id} style={{
                      border: `1px solid ${color}33`,
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      overflow: 'hidden',
                      background: '#fff',
                      marginBottom: 4,
                    }}>
                      {/* Bild */}
                      {a.image && (
                        <div style={{ position: 'relative', width: '100%', height: 64, overflow: 'hidden', background: '#f1f5f9' }}>
                          <img src={a.image} alt={a.title}
                            style={{
                              width: '100%', height: '100%', objectFit: 'cover',
                              objectPosition: `${a.crop?.x ?? 50}% ${a.crop?.y ?? 50}%`,
                              transform: `scale(${a.crop?.zoom ?? 1})`,
                            }}
                          />
                        </div>
                      )}
                      {/* Titel i accentfärg */}
                      <div style={{ padding: '4px 8px 2px', borderLeft: `3px solid ${color}` }}>
                        <div style={{ fontWeight: 800, fontSize: 11, color: color, textTransform: 'uppercase', lineHeight: 1.2 }}>{a.title}</div>
                        {a.description && (
                          <div style={{ fontSize: 9, color: layoutTheme.muted, lineHeight: 1.4, marginTop: 2 }}>{a.description}</div>
                        )}
                        {/* Badges (anmälan = gul text) */}
                        {(a.badges?.signup || a.badges?.cost || a.badges?.trip) && (
                          <div style={{ marginTop: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {a.badges?.signup && <span style={{ fontSize: 8, fontWeight: 700, color: '#d97706' }}>Anmalan kravs</span>}
                            {a.badges?.cost   && <span style={{ fontSize: 8, fontWeight: 700, color: '#7c3aed' }}>Kostnad</span>}
                            {a.badges?.trip   && <span style={{ fontSize: 8, fontWeight: 700, color: '#059669' }}>Utflykt</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Tom dag-platshallare */}
                  {day.activities.length === 0 && (
                    <div style={{
                      border: `1px dashed ${color}44`, borderTop:'none',
                      borderRadius:'0 0 6px 6px', padding:'8px',
                      fontSize:9, color: layoutTheme.muted, textAlign:'center'
                    }}>—</div>
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

/* ────────────────────────────────────────────────────────────
   VANLIG GRID-LAYOUT (standard, ej veckogrupperad)
──────────────────────────────────────────────────────────── */
function GridLayout({ activities, design, settings, layoutTheme, previewCols, onCrop }) {
  return (
    <div className="px-8 py-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}>
      {activities.map(a => (
        <div key={a.id} className="group/card bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
          {a.image && (
            <div className="relative w-full h-32 overflow-hidden bg-slate-100">
              <img src={a.image} alt={a.title}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${a.crop?.x ?? 50}% ${a.crop?.y ?? 50}%`,
                  transform: `scale(${a.crop?.zoom ?? 1})`,
                }}
              />
              <button onClick={() => onCrop?.(a.id)}
                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition px-2 py-1 rounded-lg bg-white/90 text-xs font-semibold text-slate-900">
                Justera
              </button>
            </div>
          )}
          <div className="px-3 pt-2 flex flex-wrap gap-1">
            {a.badges?.signup && <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-semibold">Anmalan</span>}
            {a.badges?.cost   && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-semibold">Kostnad</span>}
            {a.badges?.trip   && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-semibold">Utflykt</span>}
          </div>
          <div className="px-3 py-1 text-[10px]" style={{ color: layoutTheme.muted }}>
            <span className="font-semibold">{formatDate(a.date)}</span> · <span>{a.ageGroup}</span>
          </div>
          <div className="px-3 pb-3">
            <h3 className="font-bold text-sm mb-0.5" style={{ color: layoutTheme.text }}>{a.title}</h3>
            <p className="text-[10px] leading-relaxed" style={{ color: layoutTheme.muted }}>{a.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   HUVUDKOMPONENT
──────────────────────────────────────────────────────────── */
export function StudioView({
  activities, design, setDesign, settings, year, month,
  zoom, setZoom, onCrop, templates, addTemplate
}) {
  const [showSide, setShowSide] = useState(true);
  const { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare } = useExport({
    format: design.format, cloudEnabled: settings.cloudExport, yardName: settings.yardName
  });

  const previewCols = useMemo(() => design.format === 'A4 Liggande' ? 3 : 2, [design.format]);

  const layoutTheme = useMemo(() => ({
    lively:  { pageBg:'linear-gradient(180deg,#fff7ed 0%,#fff 22%)', headerBg:'#fff1e6', accent:'#ea580c', text:'#0f172a', muted:'#64748b' },
    nordic:  { pageBg:'linear-gradient(180deg,#f8fafc 0%,#fff 18%)', headerBg:'#f1f5f9', accent:'#334155', text:'#0f172a', muted:'#64748b' },
    vibrant: { pageBg:'linear-gradient(180deg,#fdf4ff 0%,#fff 18%)', headerBg:'#fae8ff', accent:'#a21caf', text:'#0f172a', muted:'#64748b' },
    gaming:  { pageBg:'linear-gradient(180deg,#111827 0%,#1f2937 40%,#111827 100%)', headerBg:'#172554', accent:'#22d3ee', text:'#f8fafc', muted:'#94a3b8' },
  }[design.layout]), [design.layout]);

  const paperWidth = { 'A4':700, 'A4 Liggande':920, 'IG Square':600, 'IG Story':450 }[design.format] ?? 700;
  // A4 portrait = 297mm ≈ 1122px vid 96dpi → vi skapar en "sida" med fast höjd
  const paperHeight = design.format === 'A4 Liggande' ? 540 : 990;

  const update      = p  => setDesign(prev => ({ ...prev, ...p }));
  const updateColor = (k,v) => setDesign(prev => ({ ...prev, colors: { ...prev.colors, [k]: v } }));

  const isWeekly = settings.groupWeeks;

  return (
    <div className="flex">
      {/* ── PREVIEW ── */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live-forhandsgranskning</h2>
            <p className="text-sm text-slate-500">{design.format} · {LAYOUTS.find(l=>l.id===design.layout)?.name} · {design.font}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.35, +(z-0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-sm font-semibold text-slate-700 w-12 text-center">{Math.round(zoom*100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.2, +(z+0.08).toFixed(2)))} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setShowSide(s => !s)} className="lg:hidden h-10 px-3 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center gap-1.5"><PanelRightOpen className="w-4 h-4" />Verktyg</button>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            id={PREVIEW_ELEMENT_ID}
            style={{
              width: paperWidth,
              height: paperHeight,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              fontFamily: design.font,
              background: layoutTheme.pageBg,
              color: layoutTheme.text,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            className="bg-white shadow-2xl rounded-xl mb-8 relative"
          >
            {/* ── HEADER ── */}
            <div style={{ background: layoutTheme.headerBg, flexShrink: 0 }}
              className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">FRITIDSGARD</div>
                <h1 className="text-2xl font-black leading-tight" style={{ color: layoutTheme.accent }}>{settings.yardName}</h1>
                <p className="text-xs mt-0.5" style={{ color: layoutTheme.muted }}>
                  {MONTH_SV[month]} {year} · aktiviteter och ungdomskultur
                </p>
              </div>

              {/* LOGOTYP (uppladdad) — ersatter QR i headern */}
              {settings.yardLogo ? (
                <img
                  src={settings.yardLogo}
                  alt="Logotyp"
                  style={{ height: 56, maxWidth: 120, objectFit: 'contain' }}
                />
              ) : (
                /* Platshallare om ingen logotyp ar uppladdad */
                <div style={{
                  width: 56, height: 56, borderRadius: 10,
                  background: layoutTheme.accent + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: layoutTheme.muted, textAlign: 'center', padding: 4
                }}>Ladda upp logotyp i Installningar</div>
              )}
            </div>

            {/* ── INNEHALL — skalas for att passa en sida ── */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
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

            {/* ── FOOTER med QR ── */}
            <div style={{ background: layoutTheme.headerBg, flexShrink: 0 }}
              className="px-8 py-3 border-t border-slate-200 flex items-center justify-between">
              <p className="text-[10px]" style={{ color: layoutTheme.muted }}>{settings.footerText}</p>
              <div className="flex items-center gap-3">
                {settings.showStockholmLogo && (
                  <span className="text-[9px] font-semibold" style={{ color: layoutTheme.muted }}>
                    Stockholm Stad
                  </span>
                )}
                {/* QR-kod i sidfoten */}
                <div className="flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(settings.qrLink)}`}
                    alt="QR"
                    style={{ width: 36, height: 36, borderRadius: 4 }}
                  />
                  <span className="text-[7px] mt-0.5" style={{ color: layoutTheme.muted }}>
                    {(settings.qrLink || '').replace('https://','').slice(0,22)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div className={`w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto ${showSide ? '' : 'hidden lg:block'}`}>

        {/* Export */}
        <Section title="Exportera">
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPNG} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}PNG
            </button>
            <button onClick={downloadPDF} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium">
              <Download className="w-4 h-4" />PDF
            </button>
            <button onClick={cloudExport} disabled={exporting || !settings.cloudExport} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium disabled:opacity-40">
              <Cloud className="w-4 h-4" />Moln
            </button>
            <button onClick={webShare} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium">
              <Share2 className="w-4 h-4" />Dela
            </button>
          </div>
          {exportError   && <p className="mt-2 text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{exportError}</p>}
          {exportSuccess && <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>{exportSuccess}</p>}
        </Section>

        {/* Community */}
        <Section title="Community Mallar">
          <button onClick={() => addTemplate?.({ title: 'Min design', layout: design.layout, public: false })}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
            Spara min design
          </button>
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
              <button key={l.id} onClick={() => update({ layout: l.id })}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                  design.layout===l.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                <div className={`h-8 rounded-lg bg-gradient-to-r ${l.gradient} mb-2`}></div>
                <div className="font-semibold text-xs text-slate-900">{l.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Format */}
        <Section title="Format">
          <div className="flex flex-wrap gap-2">{FORMATS.map(f => <Tile key={f} label={f} active={design.format===f} onClick={() => update({ format: f })} />)}</div>
        </Section>

        {/* Typsnitt */}
        <Section title="Typsnitt">
          <div className="flex flex-wrap gap-2">{FONTS.map(f => <Tile key={f} label={f} active={design.font===f} onClick={() => update({ font: f })} />)}</div>
        </Section>

        {/* Bakgrund */}
        <Section title="Bakgrund">
          <div className="flex flex-wrap gap-2 mb-3">{BACKGROUNDS.map(b => <Tile key={b} label={b} active={design.background===b} onClick={() => update({ background: b })} />)}</div>
          <label className="text-xs text-slate-500 block mb-1">Genomskinlighet: {design.backgroundOpacity}%</label>
          <input type="range" min="5" max="60" value={design.backgroundOpacity} onChange={e => update({ backgroundOpacity: +e.target.value })} className="w-full" />
        </Section>

        {/* Fargschema */}
        <Section title="Fargschema">
          <div className="flex flex-wrap gap-2 mb-3">{SCHEMES.map(s => <Tile key={s} label={s} active={design.colorScheme===s} onClick={() => update({ colorScheme: s })} />)}</div>
          {design.colorScheme === 'Per vecka' && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['week1','week2','week3','week4'].map((k,i) => (
                <div key={k} className="flex flex-col items-center gap-1">
                  <input type="color" value={design.colors?.[k] ?? WEEK_COLORS[i]}
                    onChange={e => updateColor(k, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                  <span className="text-[10px] text-slate-500">V{i+1}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Bakgrundsbild */}
        <Section title="Bakgrundsbild">
          <label className="cursor-pointer block px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-center text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition">
            <input type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => update({ backgroundImage: ev.target?.result });
                reader.readAsDataURL(file);
              }} />
            Ladda upp bakgrundsbild
          </label>
          {design.backgroundImage && (
            <button onClick={() => update({ backgroundImage: '' })} className="mt-2 text-xs text-rose-500 hover:text-rose-700">Ta bort bakgrundsbild</button>
          )}
        </Section>
      </div>
    </div>
  );
}
