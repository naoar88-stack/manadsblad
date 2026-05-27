import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, Download, Share2, Cloud, PanelRightOpen, PanelRightClose,
  Loader2, CheckCircle2, AlertCircle, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { useExport, PREVIEW_ELEMENT_ID } from '../hooks/useExport';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL= ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];

const LAYOUTS = [
  { id: 'lively',  name: 'Lively',  desc: 'Färgblock & glad energi',     gradient: 'from-orange-400 to-rose-500' },
  { id: 'nordic',  name: 'Nordic',  desc: 'Luftigt & minimalt',           gradient: 'from-slate-300 to-slate-500' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Runda & tydliga badges',       gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'gaming',  name: 'Gaming',  desc: 'Neon, mörkt & hög kontrast',   gradient: 'from-cyan-400 to-indigo-500' },
];
const FORMATS     = ['A4','A4 Liggande','IG Square','IG Story'];
const SCHEMES     = ['Per vecka','Pedagogiska färgkoder','Eget per kategori'];
const FONTS       = ['Inter','Poppins','Nunito','Montserrat','DM Sans'];
const BACKGROUNDS = ['Rutnat','Dots','Soft Glow','Ingen'];
const WEEK_COLORS = ['#4f46e5','#0ea5e9','#22c55e','#f97316','#e11d48','#7c3aed'];

const COMMUNITY_TEMPLATES = [
  { id:1, title:'Stockholm Neon',   author:'Fryshuset Väst',       public:true,  layout:'gaming',  uses:143 },
  { id:2, title:'Trygg Höst',       author:'Tensta Träff',          public:true,  layout:'nordic',  uses:88  },
  { id:3, title:'Lovspecial Juni',  author:'Ungdomshuset Nacka',    public:false, layout:'lively',  uses:21  },
  { id:4, title:'Lokal Esport',     author:'Mötesplats Rinkeby',    public:true,  layout:'vibrant', uses:57  },
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
  return `${WEEKDAY_FULL[date.getDay()].toUpperCase()} ${date.getDate()}/${date.getMonth()+1}`;
}

// ── Kollapsibel sektion i sidopanelen ──
function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Tile({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition w-full text-left ${
        active
          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}>
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
    <div style={{ display:'flex', flexDirection:'column', gap:8, padding:12 }}>
      {weeks.map((week, wi) => {
        const color = weekColorList[wi % weekColorList.length];
        const days = [...week.days.values()].sort((a,b) => a.date - b.date);
        return (
          <div key={week.wnum} style={{ background:'rgba(255,255,255,0.6)', borderRadius:12, overflow:'hidden', border:`1px solid ${color}22` }}>
            <div style={{ background: color, color:'#fff', fontSize:9, fontWeight:800, padding:'4px 10px', letterSpacing:'0.08em' }}>
              VECKA {week.wnum}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${days.length}, 1fr)`, gap:0 }}>
              {days.map(day => (
                <div key={day.date.toISOString()} style={{ padding:'6px 8px', borderRight:`1px solid ${color}18` }}>
                  <div style={{ fontSize:7, fontWeight:800, color, marginBottom:4, letterSpacing:'0.05em' }}>{formatDayHeader(day.date)}</div>
                  {day.activities.map(a => (
                    <div key={a.id} style={{ marginBottom:4, background:'rgba(255,255,255,0.9)', borderRadius:6, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                      {a.image && <img src={a.image} alt={a.title} style={{ width:'100%', height:36, objectFit:'cover', display:'block' }} />}
                      <div style={{ padding:'3px 5px' }}>
                        <div style={{ fontSize:7, fontWeight:700, color: layoutTheme.text, lineHeight:1.3 }}>{a.title}</div>
                        {a.description && <div style={{ fontSize:6, color: layoutTheme.muted, marginTop:1 }}>{a.description}</div>}
                        {(a.badges?.signup || a.badges?.cost || a.badges?.trip) && (
                          <div style={{ display:'flex', gap:2, marginTop:2, flexWrap:'wrap' }}>
                            {a.badges?.signup && <span style={{ fontSize:5.5, fontWeight:700, background:'#dcfce7', color:'#166534', padding:'1px 3px', borderRadius:3 }}>Anmälan</span>}
                            {a.badges?.cost   && <span style={{ fontSize:5.5, fontWeight:700, background:'#fef9c3', color:'#854d0e', padding:'1px 3px', borderRadius:3 }}>Kostnad</span>}
                            {a.badges?.trip   && <span style={{ fontSize:5.5, fontWeight:700, background:'#dbeafe', color:'#1e40af', padding:'1px 3px', borderRadius:3 }}>Utflykt</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {day.activities.length === 0 && <div style={{ fontSize:7, color:'#cbd5e1', fontStyle:'italic' }}>—</div>}
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
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${previewCols}, 1fr)`, gap:8, padding:12 }}>
      {activities.map(a => (
        <div key={a.id} style={{ background:'rgba(255,255,255,0.85)', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
          {a.image && (
            <div style={{ position:'relative' }}>
              <img src={a.image} alt={a.title} style={{ width:'100%', height:64, objectFit:'cover', display:'block' }} />
              <button onClick={() => onCrop?.(a.id)}
                style={{ position:'absolute', top:4, right:4, opacity:0, transition:'opacity 0.15s',
                  background:'rgba(255,255,255,0.9)', borderRadius:6, padding:'2px 6px',
                  fontSize:8, fontWeight:700, color:'#0f172a', border:'none', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity=1}
                onMouseLeave={e => e.currentTarget.style.opacity=0}>
                Justera
              </button>
            </div>
          )}
          <div style={{ padding:'6px 8px' }}>
            <div style={{ display:'flex', gap:3, marginBottom:3, flexWrap:'wrap' }}>
              {a.badges?.signup && <span style={{ fontSize:6, fontWeight:700, background:'#dcfce7', color:'#166534', padding:'1px 4px', borderRadius:3 }}>Anmälan</span>}
              {a.badges?.cost   && <span style={{ fontSize:6, fontWeight:700, background:'#fef9c3', color:'#854d0e', padding:'1px 4px', borderRadius:3 }}>Kostnad</span>}
              {a.badges?.trip   && <span style={{ fontSize:6, fontWeight:700, background:'#dbeafe', color:'#1e40af', padding:'1px 4px', borderRadius:3 }}>Utflykt</span>}
            </div>
            <div style={{ fontSize:7.5, color: layoutTheme.muted, marginBottom:2 }}>{formatDate(a.date)} · {a.ageGroup}</div>
            <div style={{ fontSize:9, fontWeight:700, color: layoutTheme.text, lineHeight:1.3 }}>{a.title}</div>
            <div style={{ fontSize:7.5, color: layoutTheme.muted, marginTop:2, lineHeight:1.4 }}>{a.description}</div>
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
    lively:  { pageBg:'linear-gradient(180deg,#fff7ed 0%,#fff 22%)',  headerBg:'#fff1e6', accent:'#ea580c', text:'#0f172a', muted:'#64748b' },
    nordic:  { pageBg:'linear-gradient(180deg,#f8fafc 0%,#fff 18%)',  headerBg:'#f1f5f9', accent:'#334155', text:'#0f172a', muted:'#64748b' },
    vibrant: { pageBg:'linear-gradient(180deg,#fdf4ff 0%,#fff 18%)',  headerBg:'#fae8ff', accent:'#a21caf', text:'#0f172a', muted:'#64748b' },
    gaming:  { pageBg:'linear-gradient(180deg,#111827 0%,#1f2937 40%,#111827 100%)', headerBg:'#172554', accent:'#22d3ee', text:'#f8fafc', muted:'#94a3b8' },
  }[design.layout]), [design.layout]);

  const paperWidth  = { 'A4':700, 'A4 Liggande':920, 'IG Square':600, 'IG Story':450 }[design.format] ?? 700;
  const paperHeight = design.format === 'A4 Liggande' ? 540 : 990;

  const update      = p => setDesign(prev => ({ ...prev, ...p }));
  const updateColor = (k, v) => setDesign(prev => ({ ...prev, colors: { ...prev.colors, [k]: v } }));
  const isWeekly    = settings.groupWeeks;

  // ── AUTO-SCALE ──
  const contentRef = useRef(null);
  const [contentScale, setContentScale] = useState(1);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setContentScale(1);
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
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-slate-100/60">

      {/* ── PREVIEW ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white/70 backdrop-blur border-b border-slate-200/60">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">Live-förhandsgranskning</p>
            <p className="text-[11px] text-slate-400 font-medium">{design.format} · {LAYOUTS.find(l => l.id === design.layout)?.name} · {design.font}</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setZoom(z => Math.max(0.35, +(z-0.08).toFixed(2)))}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition text-slate-600">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-bold text-slate-600 w-10 text-center">{Math.round(zoom*100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.2, +(z+0.08).toFixed(2)))}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition text-slate-600">
              <ZoomIn size={14} />
            </button>
          </div>
          <button onClick={() => setShowSide(s => !s)}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition text-slate-600"
            title={showSide ? 'Dölj sidopanel' : 'Visa sidopanel'}>
            {showSide ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          <div
            id={PREVIEW_ELEMENT_ID}
            style={{
              width: paperWidth, height: paperHeight,
              background: layoutTheme.pageBg,
              fontFamily: design.font,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              position: 'relative', flexShrink: 0,
              boxShadow: '0 8px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: 8,
            }}>

            {/* HEADER */}
            <div style={{ background: layoutTheme.headerBg, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <div>
                <div style={{ fontSize:8, fontWeight:800, color: layoutTheme.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>FRITIDSGÅRD</div>
                <div style={{ fontSize:20, fontWeight:900, color: layoutTheme.text, lineHeight:1.1 }}>{settings.yardName}</div>
                <div style={{ fontSize:9, color: layoutTheme.muted, marginTop:2 }}>{MONTH_SV[month]} {year} · aktiviteter och ungdomskultur</div>
              </div>
              <div style={{ textAlign:'right' }}>
                {settings.yardLogo
                  ? <img src={settings.yardLogo} alt="Logotyp" style={{ height:40, maxWidth:100, objectFit:'contain' }} />
                  : <div style={{ fontSize:7, color: layoutTheme.muted, fontStyle:'italic', opacity:0.5 }}>Ladda upp logotyp i Inställningar</div>
                }
              </div>
            </div>

            {/* INNEHÅLL */}
            <div ref={contentRef} style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ transform:`scale(${contentScale})`, transformOrigin:'top left', width:`${100/contentScale}%` }}>
                {isWeekly
                  ? <WeeklyLayout activities={activities} design={design} settings={settings}
                      year={year} month={month} layoutTheme={layoutTheme} onCrop={onCrop} />
                  : <GridLayout activities={activities} design={design} settings={settings}
                      layoutTheme={layoutTheme} previewCols={previewCols} onCrop={onCrop} />
                }
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: layoutTheme.headerBg, padding:'8px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, borderTop:`1px solid ${layoutTheme.accent}22` }}>
              <span style={{ fontSize:8, color: layoutTheme.muted }}>{settings.footerText}</span>
              {settings.showStockholmLogo && (
                <span style={{ fontSize:7, fontWeight:800, color: layoutTheme.accent, letterSpacing:'0.08em' }}>STOCKHOLM STAD</span>
              )}
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:7, fontWeight:700, background: layoutTheme.accent, color:'#fff', padding:'2px 6px', borderRadius:4, marginBottom:2 }}>QR</div>
                <div style={{ fontSize:6.5, color: layoutTheme.muted }}>{(settings.qrLink||'').replace('https://','').slice(0,22)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIDOPANEL ── */}
      {showSide && (
        <div className="w-72 shrink-0 bg-white border-l border-slate-200/70 flex flex-col h-full overflow-y-auto shadow-xl">

          {/* Export-knappar */}
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Exportera</p>
            {exporting ? (
              <div className="flex items-center justify-center py-3 gap-2 text-indigo-600">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-semibold">Exporterar…</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadPNG}
                  className="btn-primary text-white rounded-xl h-10 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Download size={13} /> PNG
                </button>
                <button onClick={downloadPDF}
                  className="btn-primary text-white rounded-xl h-10 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Download size={13} /> PDF
                </button>
                <button onClick={cloudExport}
                  className="col-span-1 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition">
                  <Cloud size={13} /> Moln
                </button>
                <button onClick={webShare}
                  className="col-span-1 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition">
                  <Share2 size={13} /> Dela
                </button>
              </div>
            )}
            {exportError   && <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={12} />{exportError}</p>}
            {exportSuccess && <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={12} />{exportSuccess}</p>}
          </div>

          {/* Mallar */}
          <Section title="Mallar" defaultOpen={false}>
            <button onClick={() => addTemplate?.({ title:'Min design', layout: design.layout, public: false })}
              className="w-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl py-2 transition">
              + Spara nuvarande design
            </button>
            <div className="space-y-2 mt-1">
              {COMMUNITY_TEMPLATES.map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.author}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {t.public ? 'Publik' : 'Privat'}
                      </span>
                      <span className="text-[9px] text-slate-400">{t.uses} användningar</span>
                    </div>
                  </div>
                  <button onClick={() => update({ layout: t.layout })}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-700 transition">
                    Ladda
                  </button>
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
                    design.layout === l.id
                      ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}>
                  <div className={`h-5 w-full rounded-md bg-gradient-to-r ${l.gradient} mb-2`} />
                  <p className="text-xs font-bold text-slate-800">{l.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{l.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Format */}
          <Section title="Format">
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(f => <Tile key={f} label={f} active={design.format === f} onClick={() => update({ format: f })} />)}
            </div>
          </Section>

          {/* Typografi */}
          <Section title="Typografi" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map(f => <Tile key={f} label={f} active={design.font === f} onClick={() => update({ font: f })} />)}
            </div>
          </Section>

          {/* Bakgrund */}
          <Section title="Bakgrund" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUNDS.map(b => <Tile key={b} label={b} active={design.background === b} onClick={() => update({ background: b })} />)}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600">Genomskinlighet</span>
                <span className="text-[11px] font-bold text-indigo-600">{design.backgroundOpacity}%</span>
              </div>
              <input type="range" min="5" max="60" value={design.backgroundOpacity}
                onChange={e => update({ backgroundOpacity: +e.target.value })}
                className="w-full accent-indigo-500" />
            </div>
            <label className="flex items-center gap-2 h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition text-xs text-slate-500 font-semibold">
              <ImageIcon size={13} className="text-slate-400" />
              Ladda upp bakgrundsbild
              <input type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update({ backgroundImage: ev.target?.result });
                  reader.readAsDataURL(file);
                }} />
            </label>
            {design.backgroundImage && (
              <button onClick={() => update({ backgroundImage: '' })}
                className="w-full text-xs text-rose-500 hover:text-rose-700 font-semibold py-1 transition">
                Ta bort bakgrundsbild
              </button>
            )}
          </Section>

          {/* Färger */}
          <Section title="Färger" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              {SCHEMES.map(s => <Tile key={s} label={s} active={design.colorScheme === s} onClick={() => update({ colorScheme: s })} />)}
            </div>
            {design.colorScheme === 'Per vecka' && (
              <div className="grid grid-cols-4 gap-2 mt-1">
                {['week1','week2','week3','week4'].map((k, i) => (
                  <div key={k} className="flex flex-col items-center gap-1.5">
                    <input type="color" value={design.colors?.[k] ?? WEEK_COLORS[i]}
                      onChange={e => updateColor(k, e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white" />
                    <span className="text-[10px] text-slate-500 font-semibold">V{i+1}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>
      )}
    </div>
  );
}
