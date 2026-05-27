import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Wand2, ImageIcon, Trash2, Check, X, Upload, Loader2, Sparkles } from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
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

function ActivityChip({ a, onUpdate, onRemove, onOpenAsset }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(a.title);
  const inputRef = useRef(null);
  useEffect(() => { if (!editing) setDraft(a.title); }, [a.title, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const confirm = () => { onUpdate(a.id, { title: draft.trim() || 'Ny aktivitet' }); setEditing(false); };
  const cancel  = () => { setDraft(a.title); setEditing(false); };
  return (
    <div className="relative group/chip flex items-center gap-1.5 bg-white border border-indigo-100 rounded-xl px-2 py-1.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
      {a.image && (
        <img src={a.image} alt={a.title}
          className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/80 shadow-sm"
          style={{ objectPosition:`${a.crop?.x??50}% ${a.crop?.y??50}%` }} />
      )}
      <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onOpenAsset(a.id)}}
        className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/90 shadow flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition z-10" title="Byt bild">
        <ImageIcon size={11} className="text-slate-600"/>
      </button>
      <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onRemove(a.id)}}
        className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition z-10" title="Ta bort">
        <X size={10} className="text-white"/>
      </button>
      {editing ? (
        <>
          <input ref={inputRef} value={draft} onChange={e=>setDraft(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter')confirm();if(e.key==='Escape')cancel();}}
            className="flex-1 text-[11px] font-semibold text-slate-900 outline-none bg-indigo-50 border border-indigo-300 rounded px-1.5 py-0.5"
            onClick={e=>e.stopPropagation()} />
          <button onClick={confirm} className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center shrink-0"><Check size={10} className="text-white"/></button>
          <button onClick={cancel}  className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center shrink-0"><X size={10} className="text-slate-600"/></button>
        </>
      ) : (
        <span onDoubleClick={()=>setEditing(true)}
          className="flex-1 text-[11px] font-semibold text-slate-800 truncate cursor-text hover:text-indigo-600 transition leading-tight"
          title={a.title}>{a.title || 'Dubbelklicka för att redigera'}</span>
      )}
    </div>
  );
}

function QuickAddForm({ day, onAdd, onCancel }) {
  const [title, setTitle]       = useState('');
  const [ageGroup, setAgeGroup] = useState('Alla åldrar');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = () => { if (!title.trim()) return; onAdd(day, { title: title.trim(), ageGroup }); };
  return (
    <div className="mt-1.5 bg-white border border-indigo-200 rounded-2xl p-3 shadow-xl space-y-2 z-20">
      <input ref={inputRef} value={title} onChange={e=>setTitle(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter')submit();if(e.key==='Escape')onCancel();}}
        placeholder="Namn på aktiviteten…"
        className="text-xs font-semibold text-slate-900 bg-white rounded-lg px-2 py-1.5 outline-none border border-indigo-200 focus:border-indigo-500 w-full shadow-sm" />
      <select value={ageGroup} onChange={e=>setAgeGroup(e.target.value)}
        className="text-[11px] text-slate-600 bg-white rounded-lg px-2 py-1 outline-none border border-indigo-200 w-full">
        {AGE_GROUPS.map(ag=><option key={ag}>{ag}</option>)}
      </select>
      <div className="flex gap-1.5">
        <button onClick={submit}   className="flex-1 btn-primary h-8 rounded-xl text-xs font-bold">✓ Lägg till</button>
        <button onClick={onCancel} className="flex-1 h-8 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition">Avbryt</button>
      </div>
    </div>
  );
}

export function SchemaView({ year, month, prevMonth, nextMonth, openDays, setOpenDays, activities, updateActivity, pushHistory, onOpenAsset }) {
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [dragActId, setDragActId]           = useState(null);
  const [dragOverDay, setDragOverDay]       = useState(null);
  const [quickAddDay, setQuickAddDay]       = useState(null);
  const [generatingImages, setGeneratingImages] = useState({});
  const [improvingText, setImprovingText]       = useState({});

  const allDays    = getDaysInMonth(year, month);
  const firstDow   = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDow + allDays.length) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDow + 1;
    return { date: new Date(year, month, dayNum), outside: dayNum < 1 || dayNum > allDays.length };
  });
  const activeDays     = cells.map(c => c.date).filter(d => openDays.includes(d.getDay()));
  const sortedActs     = sortByDate(activities);
  const activitiesOnDay = day => activities.filter(a => toISO(a.date) === toISO(day));

  const addActivity = useCallback((date, patch={}) => {
    pushHistory(sortByDate([...activities, {
      id: crypto.randomUUID(), date: date ?? activeDays[0] ?? new Date(),
      title: patch.title??'', description: patch.description??'',
      ageGroup: patch.ageGroup??'Alla åldrar', image: patch.image??DEFAULT_IMG,
      badges: patch.badges??{signup:false,cost:false,trip:false},
      crop:{x:50,y:50,zoom:1}, ...patch,
    }]));
    setQuickAddDay(null);
  }, [activities, activeDays, pushHistory]);

  const removeActivity = useCallback(id => pushHistory(activities.filter(a => a.id !== id)), [activities, pushHistory]);

  const handleDropOnDay = useCallback(day => {
    if (!dragActId || !day) return;
    pushHistory(sortByDate(activities.map(a => a.id===dragActId ? {...a, date:day} : a)));
    setDragActId(null); setDragOverDay(null);
  }, [dragActId, activities, pushHistory]);

  const handleFileDrop = useCallback(async (e, day) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => addActivity(day, { image: ev.target.result, title: file.name.replace(/\.[^.]+$/,'') });
    reader.readAsDataURL(file);
    setDragOverDay(null);
  }, [addActivity]);

  const improveText = useCallback(async (id, currentTitle) => {
    if (!currentTitle?.trim()) return;
    setImprovingText(p=>({...p,[id]:true}));
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY ?? '';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
        body: JSON.stringify({ model:'llama3-8b-8192', temperature:0.7, max_tokens:60,
          messages:[{role:'user',content:`Förbättra denna aktivitetstitel för ett månadsblad på en fritidsgård, max 5 ord, energisk och engagerande. Svara ENBART med titeln: "${currentTitle}"`}] }),
      });
      const data = await res.json();
      const improved = data.choices?.[0]?.message?.content?.trim();
      if (improved) updateActivity(id, { title: improved.replace(/^["']|["']$/g,'') });
    } catch(e) { console.error('improveText:', e); }
    setImprovingText(p=>({...p,[id]:false}));
  }, [updateActivity]);

const generateAIImage = useCallback(async (id, title) => {
  if (!title?.trim()) return;
  setGeneratingImages(p => ({ ...p, [id]: true }));
  try {
    const terms = title
      .toLowerCase()
      .replace(/fotboll/g, 'football')
      .replace(/basket/g, 'basketball')
      .replace(/dans/g, 'dance')
      .replace(/musik/g, 'music')
      .replace(/konst/g, 'art craft')
      .replace(/matlagning/g, 'cooking food')
      .replace(/utflykt/g, 'outdoor nature')
      .replace(/gaming/g, 'gaming esports')
      .replace(/film/g, 'cinema movie')
      .replace(/pyssel/g, 'craft hobby');
    const q = encodeURIComponent(terms + ' teenagers youth activity');

    // Försök Pexels om nyckel finns
    const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY ?? '';
    if (pexelsKey) {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${q}&per_page=10&orientation=landscape`,
        { headers: { Authorization: pexelsKey } }
      );
      if (res.ok) {
        const data = await res.json();
        const photos = data?.photos ?? [];
        if (photos.length > 0) {
          const pick = photos[Math.floor(Math.random() * photos.length)];
          updateActivity(id, { image: pick.src.large });
          setGeneratingImages(p => ({ ...p, [id]: false }));
          return;
        }
      }
    }

    // Fallback: Unsplash source med relevant sökterm
    const seed = Math.floor(Math.random() * 99);
    updateActivity(id, {
      image: `https://source.unsplash.com/800x500/?${q}&sig=${seed}`
    });
  } catch (e) {
    console.error('generateAIImage:', e);
  }
  setGeneratingImages(p => ({ ...p, [id]: false }));
}, [updateActivity]);

  const handleMagicImport = useCallback(parsed => {
    const safe = activeDays.length > 0 ? activeDays : [new Date(year, month, 1)];
    pushHistory(sortByDate([...activities, ...parsed.map((p,i) => ({
      id:crypto.randomUUID(), date:safe[i%safe.length],
      title:p.title||'Importerad aktivitet', description:p.description||'',
      ageGroup:p.ageGroup||'Alla åldrar', image:DEFAULT_IMG,
      badges:p.badges??{signup:false,cost:false,trip:false}, crop:{x:50,y:50,zoom:1},
    }))]));
    setShowMagicPaste(false);
  }, [activities, activeDays, year, month, pushHistory]);

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-8 pt-6 pb-24 min-h-screen">

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition"><ChevronLeft size={16} className="text-slate-600"/></button>
          <span className="font-black text-slate-800 text-lg min-w-[160px] text-center">{MONTH_SV[month]} {year}</span>
          <button onClick={nextMonth} className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition"><ChevronRight size={16} className="text-slate-600"/></button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAY_SV.map((d,i) => (
            <button key={i} onClick={()=>setOpenDays(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i])}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${openDays.includes(i)?'bg-slate-900 text-white shadow-md':'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={()=>setShowMagicPaste(true)} className="btn-ai h-10 px-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"><Wand2 size={15}/> Magic Paste</button>
          <button onClick={()=>{ const d=activeDays[0]??allDays[0]; setQuickAddDay(toISO(d)); }} className="btn-primary h-10 px-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"><Plus size={15}/> Ny aktivitet</button>
        </div>
      </div>

      {/* KALENDERRUTNÄT */}
      <div className="bg-white/70 backdrop-blur border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAY_SV.map((d,i) => (
            <div key={i} className={`py-2.5 text-center text-[11px] font-black uppercase tracking-widest ${openDays.includes(i)?'text-indigo-700':'text-slate-300'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map(({ date:day, outside }, i) => {
            const isOpen    = openDays.includes(day.getDay());
            const isToday   = toISO(day) === toISO(new Date());
            const dayActs   = activitiesOnDay(day);
            const isDragOver = dragActId && dragOverDay === toISO(day);
            const showQuick  = quickAddDay === toISO(day);
            return (
              <div key={i}
                onDragOver={e=>{ e.preventDefault(); setDragOverDay(toISO(day)); }}
                onDragLeave={()=>setDragOverDay(null)}
                onDrop={e=>{ if(e.dataTransfer.files?.length) handleFileDrop(e,day); else handleDropOnDay(day); }}
                className={`day-cell min-h-[120px] border-b border-r border-slate-100/80 p-2 flex flex-col transition-colors group ${isDragOver?'bg-indigo-50 ring-2 ring-inset ring-indigo-400':outside?'bg-slate-50/60':isOpen?'bg-white hover:bg-indigo-50/20':'bg-slate-50/40'}`}
                style={{ animationDelay:`${i*10}ms` }}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-sm font-black leading-none ${isToday?'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs':outside?'text-slate-300':isOpen?'text-slate-800':'text-slate-300'}`}>
                    {day.getDate()}
                  </span>
                  {outside && <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">{MONTH_SV[day.getMonth()].slice(0,3)}</span>}
                  {isOpen && (
                    <button onClick={()=>setQuickAddDay(toISO(day)===quickAddDay?null:toISO(day))}
                      className="h-5 w-5 rounded-md bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                      <Plus size={11}/>
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  {dayActs.map(a => (
                    <div key={a.id} draggable onDragStart={()=>setDragActId(a.id)} onDragEnd={()=>{ setDragActId(null); setDragOverDay(null); }}>
                      <ActivityChip a={a} onUpdate={updateActivity} onRemove={removeActivity} onOpenAsset={onOpenAsset}/>
                    </div>
                  ))}
                  {showQuick && <QuickAddForm day={day} onAdd={addActivity} onCancel={()=>setQuickAddDay(null)}/>}
                  {isOpen && !showQuick && dayActs.length===0 && (
                    <button onClick={()=>setQuickAddDay(toISO(day))} className="mt-auto text-[10px] text-slate-300 hover:text-indigo-500 flex items-center gap-1 transition py-0.5"><Plus size={10}/> lägg till</button>
                  )}
                  {isDragOver && <p className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1 mt-1"><Upload size={10}/> Släpp bild eller aktivitet</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AKTIVITETSLISTA */}
      {sortedActs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">Aktiviteter denna period — {sortedActs.length} st</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedActs.map(a => (
              <div key={a.id} className="group/card relative bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                {a.image ? (
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      style={{ objectPosition:`${a.crop?.x??50}% ${a.crop?.y??50}%`, transform:`scale(${a.crop?.zoom??1})` }}/>
                    <button onClick={()=>onOpenAsset(a.id)} className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-white/95 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow-md"><ImageIcon size={14} className="text-slate-700"/></button>
                    <button onClick={()=>removeActivity(a.id)} className="absolute top-2 left-2 h-8 w-8 rounded-xl bg-red-500 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow-md"><Trash2 size={14} className="text-white"/></button>
                    <button onClick={()=>generateAIImage(a.id,a.title)} disabled={generatingImages[a.id]}
                      className="absolute bottom-2 right-2 h-7 px-2.5 rounded-xl bg-indigo-600/90 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition shadow-md disabled:opacity-60">
                      {generatingImages[a.id]?<Loader2 size={11} className="text-white animate-spin"/>:<Wand2 size={11} className="text-white"/>}
                      <span className="text-[10px] font-bold text-white">AI-bild</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={()=>generateAIImage(a.id,a.title)} disabled={generatingImages[a.id]}
                    className="w-full h-20 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-60">
                    {generatingImages[a.id]?<><Loader2 size={16} className="animate-spin"/><span className="text-xs font-medium">Genererar…</span></>:<><Wand2 size={16}/><span className="text-xs font-medium">Generera AI-bild</span></>}
                  </button>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <select value={toISO(a.date)}
                      onChange={e=>{ const next=sortByDate(activities.map(x=>x.id===a.id?{...x,date:new Date(e.target.value+'T12:00:00')}:x)); pushHistory(next); }}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2 py-1 outline-none border border-indigo-100 cursor-pointer transition">
                      {activeDays.map(d=><option key={toISO(d)} value={toISO(d)}>{WEEKDAY_FULL[d.getDay()]} {d.getDate()} {MONTH_SV[d.getMonth()].slice(0,3)}{d.getMonth()!==month?` (${MONTH_SV[d.getMonth()]})`:''}</option>)}
                    </select>
                    <select value={a.ageGroup||'Alla åldrar'} onChange={e=>updateActivity(a.id,{ageGroup:e.target.value})}
                      className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1 outline-none transition">
                      {AGE_GROUPS.map(ag=><option key={ag}>{ag}</option>)}
                    </select>
                  </div>
                  <div className="relative group/title">
                    <input value={a.title??''} onChange={e=>updateActivity(a.id,{title:e.target.value})}
                      className="font-bold text-sm text-slate-900 w-full px-2 py-1.5 rounded-lg outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-300 transition placeholder:text-slate-300"
                      placeholder="Aktivitetens namn…"/>
                    <button onClick={()=>improveText(a.id,a.title)} disabled={improvingText[a.id]}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-1.5 rounded-lg bg-purple-50 text-purple-600 flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition text-[10px] font-bold disabled:opacity-50"
                      title="Förbättra med AI">
                      {improvingText[a.id]?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>} AI
                    </button>
                  </div>
                  <textarea value={a.description??''} onChange={e=>updateActivity(a.id,{description:e.target.value})}
                    className="w-full text-xs text-slate-500 px-2 py-1.5 rounded-lg outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-200 resize-none transition placeholder:text-slate-300"
                    rows={2} placeholder="Kort beskrivning (valfritt)…"/>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([k,l])=>(
                      <button key={k} onClick={()=>updateActivity(a.id,{badges:{...a.badges,[k]:!a.badges?.[k]}})}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border transition ${a.badges?.[k]?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {sortedActs.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 text-center p-10">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"><Plus className="text-slate-400" size={26}/></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Inga aktiviteter ännu</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">Klicka på ett datum i kalendern, eller använd Magic Paste för att importera ett helt schema på sekunder.</p>
          <div className="flex gap-3">
            <button onClick={()=>setShowMagicPaste(true)} className="btn-ai h-10 px-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"><Wand2 size={15}/> Magic Paste</button>
            <button onClick={()=>{ const d=activeDays[0]??allDays[0]; setQuickAddDay(toISO(d)); }} className="h-10 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 text-slate-700 transition"><Plus size={15}/> Lägg till manuellt</button>
          </div>
        </div>
      )}

      {showMagicPaste && <MagicPasteModal onImport={handleMagicImport} onClose={()=>setShowMagicPaste(false)}/>}
    </div>
  );
}
