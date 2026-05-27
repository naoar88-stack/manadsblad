import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus, ChevronLeft, ChevronRight, Wand2, ImageIcon,
  Trash2, Check, X, Loader2, Sparkles, Calendar
} from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';
import { useToast } from './Toast';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL= ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
const AGE_GROUPS  = ['10–12 år','13–15 år','16–18 år','Alla åldrar','Personal'];
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1541710430735-5f8f156ef0e6?w=600&q=80';

function toISO(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}
function getDaysInMonth(year, month) {
  const days = [], d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate()+1); }
  return days;
}
function sortByDate(arr) { return [...arr].sort((a,b) => new Date(a.date) - new Date(b.date)); }

// ── Aktivitets-chip i kalendern ──
function ActivityChip({ a, onUpdate, onRemove, onOpenAsset, onGenerateImage, generatingImage }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(a.title);
  const inputRef = useRef(null);
  useEffect(() => { if (!editing) setDraft(a.title); }, [a.title, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const confirm = () => { onUpdate(a.id, { title: draft.trim() || 'Ny aktivitet' }); setEditing(false); };
  const cancel  = () => { setDraft(a.title); setEditing(false); };

  return (
    <div className="activity-chip relative group/chip rounded-xl overflow-hidden bg-white border border-slate-100 mb-1.5 cursor-grab active:cursor-grabbing">

      {/* Bild eller alltid-synlig AI-knapp */}
      {a.image ? (
        <img src={a.image} alt={a.title}
          className="w-full h-12 object-cover block"
          onError={e => e.currentTarget.style.display='none'} />
      ) : (
        <button
          onClick={e => { e.stopPropagation(); onGenerateImage?.(a.id, a.title); }}
          disabled={generatingImage}
          className="w-full h-8 bg-slate-50 hover:bg-indigo-50 flex items-center justify-center gap-1 text-slate-400 hover:text-indigo-500 transition disabled:opacity-50 border-b border-slate-100">
          {generatingImage
            ? <Loader2 size={10} className="animate-spin text-indigo-400"/>
            : <ImageIcon size={10}/>}
          <span className="text-[9px] font-bold">{generatingImage ? 'Hämtar…' : 'AI-bild'}</span>
        </button>
      )}

      {/* Hover-actions (synliga vid hover) */}
      <button onClick={e => { e.stopPropagation(); onOpenAsset(a.id); }}
        className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/95 shadow flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition z-10"
        title="Byt bild">
        <ImageIcon size={11} className="text-slate-600"/>
      </button>
      <button onClick={e => { e.stopPropagation(); onRemove(a.id); }}
        className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition z-10"
        title="Ta bort">
        <X size={10} className="text-white"/>
      </button>

      <div className="px-2 py-1.5">
        {editing ? (
          <div className="flex gap-1">
            <input ref={inputRef} value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter') confirm(); if(e.key==='Escape') cancel(); }}
              className="flex-1 text-[11px] font-semibold text-slate-900 outline-none bg-indigo-50 border border-indigo-300 rounded px-1.5 py-0.5"
              onClick={e => e.stopPropagation()}/>
            <button onClick={confirm} className="text-emerald-600"><Check size={12}/></button>
            <button onClick={cancel}  className="text-slate-400"><X size={12}/></button>
          </div>
        ) : (
          <p onDoubleClick={() => setEditing(true)}
            className="text-[11px] font-semibold text-slate-800 truncate cursor-text hover:text-indigo-600 transition leading-tight"
            title={a.title}>
            {a.title || 'Dubbelklicka för att redigera'}
          </p>
        )}
        {a.ageGroup && a.ageGroup !== 'Alla åldrar' && (
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{a.ageGroup}</p>
        )}
      </div>
    </div>
  );
}

// ── Snabblägga-formulär ──
function QuickAddForm({ day, onAdd, onCancel }) {
  const [title, setTitle]       = useState('');
  const [ageGroup, setAgeGroup] = useState('Alla åldrar');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = () => { if (!title.trim()) return; onAdd(day, { title: title.trim(), ageGroup }); };

  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-2 space-y-1.5 mt-1 shadow-sm">
      <input ref={inputRef} value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter') submit(); if(e.key==='Escape') onCancel(); }}
        placeholder="Aktivitetens namn…"
        className="text-xs font-semibold text-slate-900 bg-white rounded-lg px-2.5 py-2 outline-none border border-indigo-200 focus:border-indigo-500 w-full shadow-sm transition"/>
      <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
        className="text-[11px] text-slate-600 bg-white rounded-lg px-2 py-1.5 outline-none border border-indigo-200 w-full">
        {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
      </select>
      <div className="flex gap-1.5">
        <button onClick={submit}
          className="flex-1 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1">
          <Check size={12}/> Lägg till
        </button>
        <button onClick={onCancel}
          className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition flex items-center justify-center">
          <X size={12}/>
        </button>
      </div>
    </div>
  );
}

// ── Aktivitetskort i listan ──
function ActivityCard({ a, activeDays, month, activities, updateActivity, pushHistory, onOpenAsset, onRemove, onGenerateImage, onImproveText, generatingImages, improvingText }) {
  const MON = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

  return (
    <div className="group/card relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* ── Bild / knappar ── */}
      <div className="relative">
        {a.image ? (
          <>
            <img src={a.image} alt={a.title}
              className="w-full h-32 object-cover block"
              onError={e => e.currentTarget.style.display='none'}/>
            {/* Hover-overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-between p-2">
              <button onClick={() => onRemove(a.id)}
                className="h-7 w-7 rounded-xl bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition">
                <Trash2 size={13} className="text-white"/>
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => onGenerateImage(a.id, a.title)} disabled={generatingImages[a.id]}
                  className="h-7 px-2.5 rounded-xl bg-indigo-600/90 flex items-center gap-1 shadow-md text-white text-[10px] font-bold hover:bg-indigo-700 transition disabled:opacity-60">
                  {generatingImages[a.id] ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>} AI-bild
                </button>
                <button onClick={() => onOpenAsset(a.id)}
                  className="h-7 w-7 rounded-xl bg-white/95 flex items-center justify-center shadow-md hover:bg-white transition">
                  <ImageIcon size={12} className="text-slate-700"/>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── INGEN BILD — alltid synliga knappar ── */
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 space-y-2">
            <button
              onClick={() => onGenerateImage(a.id, a.title)}
              disabled={generatingImages[a.id]}
              className="w-full h-12 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs transition disabled:opacity-60">
              {generatingImages[a.id]
                ? <><Loader2 size={14} className="animate-spin"/> Hämtar bild…</>
                : <><Sparkles size={14}/> Generera AI-bild</>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onOpenAsset(a.id)}
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 text-slate-600 font-semibold text-xs transition">
                <ImageIcon size={12}/> Välj bild
              </button>
              <button
                onClick={() => onRemove(a.id)}
                className="h-9 w-9 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition">
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Datum + åldersgrupp */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={toISO(a.date)}
            onChange={e => {
              const next = sortByDate(activities.map(x => x.id===a.id ? {...x, date: new Date(e.target.value+'T12:00:00')} : x));
              pushHistory(next);
            }}
            className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-3 py-1.5 outline-none border border-indigo-100 cursor-pointer transition">
            {activeDays.map(d => (
              <option key={toISO(d)} value={toISO(d)}>
                {WEEKDAY_FULL[d.getDay()]} {d.getDate()} {MON[d.getMonth()]}
                {d.getMonth()!==month ? ` (${MON[d.getMonth()]})` : ''}
              </option>
            ))}
          </select>
          <select value={a.ageGroup||'Alla åldrar'}
            onChange={e => updateActivity(a.id, { ageGroup: e.target.value })}
            className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl px-2.5 py-1.5 outline-none transition">
            {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
          </select>
        </div>

        {/* Titel + AI-förbättra */}
        <div className="relative group/title">
          <input value={a.title ?? ''}
            onChange={e => updateActivity(a.id, { title: e.target.value })}
            className="font-bold text-base text-slate-900 w-full px-3 py-2 rounded-xl outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-300 transition placeholder:text-slate-300"
            placeholder="Aktivitetens namn…"/>
          <button onClick={() => onImproveText(a.id, a.title)} disabled={improvingText[a.id]}
            title="Förbättra med AI"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition text-[10px] font-bold disabled:opacity-50">
            {improvingText[a.id] ? <Loader2 size={9} className="animate-spin"/> : <Sparkles size={9}/>} AI
          </button>
        </div>

        {/* Beskrivning */}
        <textarea value={a.description ?? ''}
          onChange={e => updateActivity(a.id, { description: e.target.value })}
          className="w-full text-sm text-slate-500 px-3 py-2 rounded-xl outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-200 resize-none transition placeholder:text-slate-300"
          rows={2} placeholder="Kort beskrivning (valfritt)…"/>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {[
            ['signup','Anmälan','bg-emerald-100 text-emerald-700 border-emerald-200'],
            ['cost',  'Kostnad', 'bg-amber-100 text-amber-700 border-amber-200'],
            ['trip',  'Utflykt', 'bg-sky-100 text-sky-700 border-sky-200'],
          ].map(([k,l,cls]) => (
            <button key={k}
              onClick={() => updateActivity(a.id, { badges: { ...a.badges, [k]: !a.badges?.[k] } })}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                a.badges?.[k] ? cls : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// HUVUDKOMPONENT
// ────────────────────────────────────────────
export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, pushHistory,
  onOpenAsset,
}) {
  const toast = useToast();
  const [showMagicPaste,   setShowMagicPaste]   = useState(false);
  const [dragActId,        setDragActId]         = useState(null);
  const [dragOverDay,      setDragOverDay]        = useState(null);
  const [quickAddDay,      setQuickAddDay]        = useState(null);
  const [generatingImages, setGeneratingImages]   = useState({});
  const [improvingText,    setImprovingText]      = useState({});
  const [generatingAll,    setGeneratingAll]      = useState(false);

  const allDays    = getDaysInMonth(year, month);
  const firstDow   = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDow + allDays.length) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDow + 1;
    return { date: new Date(year, month, dayNum), outside: dayNum < 1 || dayNum > allDays.length };
  });

  const activeDays      = cells.map(c => c.date).filter(d => openDays.includes(d.getDay()));
  const sortedActs      = sortByDate(activities);
  const activitiesOnDay = day => activities.filter(a => toISO(a.date) === toISO(day));

  // ── Lägg till aktivitet ──
  const addActivity = useCallback((date, patch = {}) => {
    pushHistory(sortByDate([...activities, {
      id:          crypto.randomUUID(),
      date:        date ?? activeDays[0] ?? new Date(),
      title:       patch.title       ?? '',
      description: patch.description ?? '',
      ageGroup:    patch.ageGroup    ?? 'Alla åldrar',
      image:       patch.image       ?? DEFAULT_IMG,
      badges:      patch.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
      ...patch,
    }]));
    setQuickAddDay(null);
    toast?.success(`"${patch.title || 'Ny aktivitet'}" tillagd ✓`);
  }, [activities, activeDays, pushHistory, toast]);

  // ── Ta bort aktivitet ──
  const removeActivity = useCallback(id => {
    const name = activities.find(a => a.id === id)?.title || 'Aktivitet';
    pushHistory(activities.filter(a => a.id !== id));
    toast?.info(`"${name}" borttagen`);
  }, [activities, pushHistory, toast]);

  // ── Drag & drop ──
  const handleDropOnDay = useCallback(day => {
    if (!dragActId || !day) return;
    pushHistory(sortByDate(activities.map(a => a.id === dragActId ? { ...a, date: day } : a)));
    setDragActId(null);
    setDragOverDay(null);
    toast?.success('Aktivitet flyttad ✓');
  }, [dragActId, activities, pushHistory, toast]);

  const handleFileDrop = useCallback(async (e, day) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => addActivity(day, { image: ev.target.result, title: file.name.replace(/\.[^.]+$/, '') });
    reader.readAsDataURL(file);
    setDragOverDay(null);
  }, [addActivity]);

  // ── AI: Förbättra text ──
  const improveText = useCallback(async (id, currentTitle) => {
    if (!currentTitle?.trim()) return;
    setImprovingText(p => ({ ...p, [id]: true }));
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY ?? '';
      if (!apiKey) {
        toast?.error('Lägg till VITE_GROQ_API_KEY i Vercel för AI-textförbättring');
        setImprovingText(p => ({ ...p, [id]: false }));
        return;
      }
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama3-8b-8192', temperature: 0.7, max_tokens: 60,
          messages: [{ role: 'user', content: `Förbättra denna aktivitetstitel för ett månadsblad på en fritidsgård, max 5 ord, energisk och engagerande. Svara ENBART med titeln: "${currentTitle}"` }],
        }),
      });
      const data = await res.json();
      const improved = data.choices?.[0]?.message?.content?.trim();
      if (improved) {
        updateActivity(id, { title: improved.replace(/^["']|["']$/g, '') });
        toast?.success('Titel förbättrad med AI ✓');
      }
    } catch (e) {
      console.error('improveText:', e);
      toast?.error('Kunde inte förbättra texten');
    }
    setImprovingText(p => ({ ...p, [id]: false }));
  }, [updateActivity, toast]);

  // ── AI: Hämta bild ──
  const generateAIImage = useCallback(async (id, title) => {
    if (!title?.trim()) return;
    setGeneratingImages(p => ({ ...p, [id]: true }));
    try {
      const terms = title.toLowerCase()
        .replace(/fotboll/g,    'football')
        .replace(/basket/g,     'basketball')
        .replace(/dans/g,       'dance')
        .replace(/musik/g,      'music')
        .replace(/konst/g,      'art craft')
        .replace(/matlagning/g, 'cooking food')
        .replace(/utflykt/g,    'outdoor nature')
        .replace(/gaming/g,     'gaming esports')
        .replace(/film/g,       'cinema movie')
        .replace(/pyssel/g,     'craft hobby');
      const q         = encodeURIComponent(terms + ' teenagers youth activity');
      const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY ?? '';
      if (pexelsKey) {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${q}&per_page=10&orientation=landscape`,
          { headers: { Authorization: pexelsKey } }
        );
        if (res.ok) {
          const data   = await res.json();
          const photos = data?.photos ?? [];
          if (photos.length > 0) {
            const pick = photos[Math.floor(Math.random() * photos.length)];
            updateActivity(id, { image: pick.src.large });
            toast?.success('Bild hämtad ✓');
            setGeneratingImages(p => ({ ...p, [id]: false }));
            return;
          }
        }
      }
      const seed = Math.floor(Math.random() * 99);
      updateActivity(id, { image: `https://source.unsplash.com/800x500/?${q}&sig=${seed}` });
      toast?.success('Bild hämtad ✓');
    } catch (e) {
      console.error('generateAIImage:', e);
      toast?.error('Kunde inte hämta bild');
    }
    setGeneratingImages(p => ({ ...p, [id]: false }));
  }, [updateActivity, toast]);

  // ── AI: Generera bilder till ALLA som saknar ──
  const generateAllImages = useCallback(async () => {
    const without = activities.filter(a => !a.image);
    if (!without.length) return;
    setGeneratingAll(true);
    toast?.info(`Genererar bilder för ${without.length} aktiviteter…`);
    for (const a of without) {
      await generateAIImage(a.id, a.title);
    }
    setGeneratingAll(false);
    toast?.success('Alla bilder klara ✓');
  }, [activities, generateAIImage, toast]);

  // ── Magic Paste import ──
  const handleMagicImport = useCallback(parsed => {
    const safe = activeDays.length > 0 ? activeDays : [new Date(year, month, 1)];
    pushHistory(sortByDate([
      ...activities,
      ...parsed.map((p, i) => ({
        id:          crypto.randomUUID(),
        date:        p.dateKey ? new Date(p.dateKey + 'T12:00:00') : safe[i % safe.length],
        title:       p.title       || 'Importerad aktivitet',
        description: p.description || '',
        ageGroup:    p.ageGroup    || 'Alla åldrar',
        image:       DEFAULT_IMG,
        badges:      p.badges      ?? { signup: false, cost: false, trip: false },
        crop:        { x: 50, y: 50, zoom: 1 },
      })),
    ]));
    setShowMagicPaste(false);
    toast?.success(`${parsed.length} aktiviteter importerade ✓`);
  }, [activities, activeDays, year, month, pushHistory, toast]);

  const hasImageless = activities.some(a => !a.image);

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Månadsnavigation */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm px-2 py-1.5">
          <button onClick={prevMonth}
            className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
            <ChevronLeft size={16}/>
          </button>
          <span className="text-sm font-black text-slate-900 w-36 text-center tracking-tight">
            {MONTH_SV[month]} {year}
          </span>
          <button onClick={nextMonth}
            className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
            <ChevronRight size={16}/>
          </button>
        </div>

        {/* Veckodagväljare */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5">
          {WEEKDAY_SV.map((d, i) => (
            <button key={i}
              onClick={() => setOpenDays(prev =>
                prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
              )}
              className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                openDays.includes(i)
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-100'
              }`}>
              {d}
            </button>
          ))}
        </div>

        {/* Höger-knappar */}
        <div className="flex gap-2 ml-auto flex-wrap justify-end">

          {/* AI-bilder till alla — visas bara om någon saknar bild */}
          {hasImageless && (
            <button
              onClick={generateAllImages}
              disabled={generatingAll || Object.values(generatingImages).some(Boolean)}
              className="h-10 px-4 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center gap-2 transition disabled:opacity-50">
              {generatingAll
                ? <><Loader2 size={14} className="animate-spin"/> Genererar…</>
                : <><Sparkles size={14}/> AI-bilder till alla</>}
            </button>
          )}

          <button onClick={() => setShowMagicPaste(true)}
            className="btn-ai h-10 px-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2">
            <Wand2 size={15}/> Magic Paste
          </button>
          <button onClick={() => {
            const d = activeDays[0] ?? allDays[0];
            setQuickAddDay(toISO(d));
          }}
            className="btn-primary h-10 px-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2">
            <Plus size={15}/> Ny aktivitet
          </button>
        </div>
      </div>

      {/* ── KALENDER ── */}
      <div className="bg-white/70 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden calendar-mobile-stack">

        {/* Veckodagsrubriker */}
        <div className="grid grid-cols-7 border-b border-slate-100 calendar-header-mobile sm:grid">
          {WEEKDAY_SV.map((d, i) => (
            <div key={i} className={`py-3 text-center text-xs font-black tracking-widest uppercase ${
              openDays.includes(i) ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {d}
            </div>
          ))}
        </div>

        {/* Dagar */}
        <div className="grid grid-cols-7 border-t border-slate-100/50">
          {cells.map(({ date: day, outside }, i) => {
            const isOpen     = openDays.includes(day.getDay());
            const isToday    = toISO(day) === toISO(new Date());
            const dayActs    = activitiesOnDay(day);
            const isDragOver = dragActId && dragOverDay === toISO(day);
            const showQuick  = quickAddDay === toISO(day);

            return (
              <div key={i}
                draggable={false}
                onDragOver={e => { e.preventDefault(); setDragOverDay(toISO(day)); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={e => {
                  if (e.dataTransfer.files?.length) handleFileDrop(e, day);
                  else handleDropOnDay(day);
                }}
                className={[
                  'day-cell min-h-[120px] border-b border-r border-slate-100/80 p-2 flex flex-col transition-colors group relative',
                  isDragOver ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400'
                    : outside  ? 'bg-slate-50/60'
                    : isOpen   ? 'bg-white hover:bg-indigo-50/20'
                    :            'bg-slate-50/40',
                  !isOpen && !outside ? 'day-cell--closed' : '',
                ].join(' ')}
                style={{ animationDelay: `${i * 8}ms` }}>

                {/* Datum — desktop */}
                <div className="day-label-desktop items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition ${
                    isToday    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300/50'
                    : outside  ? 'text-slate-300'
                    : isOpen   ? 'text-slate-700'
                    :            'text-slate-400'
                  }`}>
                    {day.getDate()}
                  </span>
                  {isOpen && (
                    <button
                      onClick={() => setQuickAddDay(toISO(day) === quickAddDay ? null : toISO(day))}
                      className="h-5 w-5 rounded-md bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                      <Plus size={11}/>
                    </button>
                  )}
                </div>

                {/* Datum — mobil */}
                {isOpen && (
                  <div className="day-label-mobile items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-100'
                      }`}>
                        {day.getDate()}
                      </span>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                        {WEEKDAY_SV[day.getDay()]}
                      </span>
                    </div>
                    <button
                      onClick={() => setQuickAddDay(toISO(day) === quickAddDay ? null : toISO(day))}
                      className="h-6 w-6 rounded-lg bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-600 transition">
                      <Plus size={12}/>
                    </button>
                  </div>
                )}

                {/* Aktivitetschips */}
                {dayActs.map(a => (
                  <div key={a.id} draggable
                    onDragStart={() => setDragActId(a.id)}
                    onDragEnd={() => { setDragActId(null); setDragOverDay(null); }}>
                    <ActivityChip
                      a={a}
                      onUpdate={updateActivity}
                      onRemove={removeActivity}
                      onOpenAsset={onOpenAsset}
                      onGenerateImage={generateAIImage}
                      generatingImage={generatingImages[a.id]}
                    />
                  </div>
                ))}

                {showQuick && (
                  <QuickAddForm day={day} onAdd={addActivity} onCancel={() => setQuickAddDay(null)}/>
                )}

                {isOpen && !showQuick && dayActs.length === 0 && (
                  <button onClick={() => setQuickAddDay(toISO(day))}
                    className="mt-auto text-[10px] text-slate-300 hover:text-indigo-400 flex items-center gap-1 transition py-0.5 font-medium">
                    <Plus size={10}/> lägg till
                  </button>
                )}

                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-50/80 rounded-lg text-[11px] font-bold text-indigo-600 pointer-events-none">
                    Släpp här
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AKTIVITETSLISTA ── */}
      {sortedActs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Aktiviteter — <span className="text-indigo-600">{sortedActs.length} st</span>
            </h2>
            <div className="flex-1 h-px bg-slate-200"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedActs.map(a => (
              <ActivityCard key={a.id} a={a}
                activeDays={activeDays}
                month={month}
                activities={activities}
                updateActivity={updateActivity}
                pushHistory={pushHistory}
                onOpenAsset={onOpenAsset}
                onRemove={removeActivity}
                onGenerateImage={generateAIImage}
                onImproveText={improveText}
                generatingImages={generatingImages}
                improvingText={improvingText}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {sortedActs.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 text-center p-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
            <Calendar size={28} className="text-indigo-400"/>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Inga aktiviteter ännu</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
            Klicka på ett datum i kalendern, eller använd Magic Paste för att importera ett helt schema på sekunder.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => setShowMagicPaste(true)}
              className="btn-ai h-11 px-5 rounded-2xl text-white font-bold text-sm flex items-center gap-2">
              <Wand2 size={15}/> Magic Paste
            </button>
            <button onClick={() => {
              const d = activeDays[0] ?? allDays[0];
              setQuickAddDay(toISO(d));
            }}
              className="h-11 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-sm flex items-center gap-2 text-slate-700 transition">
              <Plus size={15}/> Lägg till manuellt
            </button>
          </div>
        </div>
      )}

      {/* ── MAGIC PASTE MODAL ── */}
      {showMagicPaste && (
        <MagicPasteModal
          onImport={handleMagicImport}
          onClose={() => setShowMagicPaste(false)}
          yearMonth={`${MONTH_SV[month]} ${year}`}
        />
      )}
    </div>
  );
}
