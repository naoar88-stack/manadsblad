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

  const paperWidth  = design.format === 'A4 Liggande' ? 842 : 595;
  const paperHeight = design.format === 'A4 Liggande' ? 540 : 990;

  // ── contentScale: krymper innehållet om det svämmar över ──
  const contentRef = useRef(null);
  const [contentScale, setContentScale] = useState(1);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Mät tillgänglig vs faktisk höjd
    const available = el.clientHeight;
    const actual    = el.scrollHeight;
    if (actual > available && available > 0) {
      setContentScale(available / actual);
    } else {
      setContentScale(1);
    }
  }, [activities, design]);

  const layoutTheme = useMemo(() => {
    const themes = {
      lively:  { pageBg:'#fff7ed', headerBg:'#f97316', text:'#1c1917', muted:'#78716c', accent:'#f97316' },
      nordic:  { pageBg:'#f8fafc', headerBg:'#e2e8f0', text:'#1e293b', muted:'#64748b', accent:'#0f172a' },
      vibrant: { pageBg:'#fdf4ff', headerBg:'#a855f7', text:'#1e1b4b', muted:'#7c3aed', accent:'#a855f7' },
      gaming:  { pageBg:'#0f172a', headerBg:'#1e293b', text:'#e2e8f0', muted:'#94a3b8', accent:'#22d3ee' },
    };
    return themes[design.layout] || themes.lively;
  }, [design.layout]);

  const isWeekly = design.viewMode === 'weekly';

  // ── Header-logotyp ──
  const headerLogo = settings.logoUrl
    ? <img src={settings.logoUrl} alt="Logotyp" style={{ height:30, maxWidth:80, objectFit:'contain', borderRadius:4 }} />
    : <div style={{ fontWeight:900, fontSize:13, color: layoutTheme.headerBg === '#e2e8f0' ? '#1e293b' : '#fff', letterSpacing:'0.04em' }}>
        {settings.yardName || 'Mötesplats'}
      </div>;

  const isLight = ['lively','nordic','vibrant'].includes(design.layout);

  return (
    <div style={{ display:'flex', height:'100%', background:'#f1f5f9', overflow:'hidden' }}>

      {/* ── FÖRHANDSGRANSKNING ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer' }}>
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'flex', alignItems:'center', minWidth:44, justifyContent:'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer' }}>
              <ZoomIn size={14} />
            </button>
          </div>

          <div style={{ flex:1 }} />

          {exporting && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748b' }}><Loader2 size={14} className="animate-spin" /> Exporterar…</span>}
          {exportSuccess && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#16a34a' }}><CheckCircle2 size={14} /> Klart!</span>}
          {exportError && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#dc2626' }}><AlertCircle size={14} /> {exportError}</span>}

          <button onClick={downloadPNG} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'none', background:'#0f172a', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Download size={13} /> PNG
          </button>
          <button onClick={downloadPDF} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'1px solid #e2e8f0', background:'#fff', color:'#0f172a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Download size={13} /> PDF
          </button>
          {settings.cloudExport && (
            <button onClick={cloudExport} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'1px solid #e2e8f0', background:'#fff', color:'#0f172a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Cloud size={13} /> Moln
            </button>
          )}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button onClick={webShare} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'1px solid #e2e8f0', background:'#fff', color:'#0f172a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Share2 size={13} /> Dela
            </button>
          )}
          <button onClick={() => setShowSide(v => !v)} style={{ padding:'7px 10px', borderRadius:9, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', color:'#64748b' }}>
            {showSide ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>

        {/* Canvas-area */}
        <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center', padding:40 }}>
          <div
            id={PREVIEW_ELEMENT_ID}
            style={{
              width: paperWidth,
              height: paperHeight,
              background: layoutTheme.pageBg,
              fontFamily: design.font || 'Inter',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              borderRadius: 8,
            }}
          >
            {/* ── HEADER ── */}
            <div style={{
              background: layoutTheme.headerBg,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              {headerLogo}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:900, color: isLight ? (layoutTheme.headerBg === '#e2e8f0' ? '#1e293b' : '#fff') : '#e2e8f0', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  {MONTH_SV[month]} {year}
                </div>
                <div style={{ fontSize:9, color: isLight ? (layoutTheme.headerBg === '#e2e8f0' ? '#64748b' : 'rgba(255,255,255,0.75)') : '#94a3b8', marginTop:2 }}>
                  {settings.yardName || ''}
                </div>
              </div>
              <div style={{ fontSize:9, color: isLight ? (layoutTheme.headerBg === '#e2e8f0' ? '#64748b' : 'rgba(255,255,255,0.7)') : '#94a3b8', textAlign:'right' }}>
                {activities.length} aktiviteter
              </div>
            </div>

            {/* ── INNEHÅLL — skalas för att passa en sida ── */}
            <div
              ref={contentRef}
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                transform: `scale(${contentScale})`,
                transformOrigin: 'top left',
                width: contentScale < 1 ? `${100 / contentScale}%` : '100%',
                flexShrink: 0,
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

            {/* ── FOOTER ── */}
            <div style={{
              background: layoutTheme.headerBg,
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{ fontSize:8, color: isLight ? (layoutTheme.headerBg === '#e2e8f0' ? '#94a3b8' : 'rgba(255,255,255,0.6)') : '#475569' }}>
                {settings.address || ''}
              </span>
              {settings.showQr && settings.websiteUrl && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${encodeURIComponent(settings.websiteUrl)}`}
                  alt="QR"
                  style={{ width:40, height:40, borderRadius:4 }}
                />
              )}
              <span style={{ fontSize:8, color: isLight ? (layoutTheme.headerBg === '#e2e8f0' ? '#94a3b8' : 'rgba(255,255,255,0.6)') : '#475569' }}>
                {settings.websiteUrl || ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIDOPANEL ── */}
      {showSide && (
        <div style={{ width:300, background:'#fff', borderLeft:'1px solid #e2e8f0', overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column' }}>

          <Section title="Layout">
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => setDesign(d => ({ ...d, layout: l.id }))}
                  className={`rounded-xl p-3 text-left border transition ${design.layout === l.id ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`h-6 rounded-lg bg-gradient-to-r ${l.gradient} mb-2`} />
                  <div className="text-xs font-bold text-slate-800">{l.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-tight">{l.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Format">
            <div className="grid grid-cols-2 gap-1.5">
              {FORMATS.map(f => <Tile key={f} label={f} active={design.format === f} onClick={() => setDesign(d => ({ ...d, format: f }))} />)}
            </div>
          </Section>

          <Section title="Vy">
            <div className="grid grid-cols-2 gap-1.5">
              <Tile label="Rutnät" active={design.viewMode !== 'weekly'} onClick={() => setDesign(d => ({ ...d, viewMode: 'grid' }))} />
              <Tile label="Per vecka" active={design.viewMode === 'weekly'} onClick={() => setDesign(d => ({ ...d, viewMode: 'weekly' }))} />
            </div>
          </Section>

          {design.viewMode === 'weekly' && (
            <Section title="Veckofärger">
              <div className="space-y-2">
                {['week1','week2','week3','week4'].map((key, i) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-14">Vecka {i + 1}</span>
                    <input type="color" value={(design.colors || {})[key] || WEEK_COLORS[i]}
                      onChange={e => setDesign(d => ({ ...d, colors: { ...(d.colors || {}), [key]: e.target.value } }))}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <span className="text-xs text-slate-400">{(design.colors || {})[key] || WEEK_COLORS[i]}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Typografi">
            <div className="grid grid-cols-1 gap-1">
              {FONTS.map(f => <Tile key={f} label={f} active={design.font === f} onClick={() => setDesign(d => ({ ...d, font: f }))} />)}
            </div>
          </Section>

          <Section title="Färgschema" defaultOpen={false}>
            <div className="grid grid-cols-1 gap-1">
              {SCHEMES.map(s => <Tile key={s} label={s} active={design.scheme === s} onClick={() => setDesign(d => ({ ...d, scheme: s }))} />)}
            </div>
          </Section>

          <Section title="Bakgrund" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-1">
              {BACKGROUNDS.map(b => <Tile key={b} label={b} active={design.background === b} onClick={() => setDesign(d => ({ ...d, background: b }))} />)}
            </div>
          </Section>

          <Section title="Mallar" defaultOpen={false}>
            <button onClick={() => addTemplate?.(design)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition">
              Spara nuvarande som mall
            </button>
            {(templates || []).map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">{t.name}</span>
                <button onClick={() => setDesign(t.design)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Använd</button>
              </div>
            ))}
          </Section>

          <Section title="Community" defaultOpen={false}>
            {COMMUNITY_TEMPLATES.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{t.title}</span>
                  {t.public && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Publik</span>}
                </div>
                <div className="text-xs text-slate-400">{t.author} · {t.uses} användningar</div>
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Använd mall</button>
              </div>
            ))}
          </Section>

        </div>
      )}
    </div>
  );
}
