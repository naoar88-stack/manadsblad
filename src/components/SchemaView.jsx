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
  const cells = Array.from({ 
