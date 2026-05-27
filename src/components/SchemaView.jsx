import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Wand2, ImageIcon, Trash2, Check, X } from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';

const MONTH_SV     = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV   = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
const AGE_GROUPS   = ['10–12 år','13–15 år','16–18 år','Alla åldrar','Personal'];
const DEFAULT_IMG  = 'https://images.unsplash.com/photo-1541710430735-5f8f156ef0e6?w=600&q=80';

// FIX #4 — tidzonssäker ISO utan UTC-offset
function toISO(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getDaysInMonth(year, month) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}

function sortByDate(arr) {
  return [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));
}

// FIX #6 — draft synkas med a.title vid extern uppdatering
function ActivityChip({ a, onUpdate, onRemove, onOpenAsset }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(a.title);
  const inputRef              = useRef(null);

  // Uppdatera draft när titeln ändras utifrån (Firebase-sync)
  useEffect(() => { if (!editing) setDraft(a.title); }, [a.title, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const confirm = () => {
    onUpdate(a.id, { title: draft.trim() || 'Ny aktivitet' });
    setEditing(false);
  };
  const cancel = () => { setDraft(a.title); setEditing(false); };

  return (
    <div
      draggable={!editing}
      className="activity-chip group/chip relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none border border-slate-100"
      style={{ marginBottom: 5 }}
    >
      {a.image && (
        <div className="relative">
          <img
            src={a.image}
            alt={a.title}
            className="w-full object-cover"
            style={{ height: 48, display: 'block' }}
          />
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onOpenAsset(a.id); }}
            className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/90 shadow flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
          >
            <ImageIcon size={11} />
          </button>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onRemove(a.id); }}
            className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
          >
            <Trash2 size={9} className="text-white" />
          </button>
        </div>
      )}

      <div className="bg-white px-2 py-1.5 flex items-center gap-1 min-h-[30px]">
        {editing ? (
          <>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); }}
              className="flex-1 text-[11px] font-semibold text-slate-900 outline-none bg-indigo-50 border border-indigo-300 rounded px-1.5 py-0.5"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={confirm} className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center shrink-0">
              <Check size={9} className="text-white" />
            </button>
            <button onClick={cancel} className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center shrink-0">
              <X size={9} />
            </button>
          </>
        ) : (
          <span
            onClick={() => setEditing(true)}
            className="flex-1 text-[11px] font-semibold text-slate-800 truncate cursor-text hover:text-indigo-600 transition leading-tight"
            title={a.title}
          >
            {a.title || 'Klicka för att namnge'}
          </span>
        )}
      </div>
    </div>
  );
}

function QuickAddForm({ day, onAdd, onCancel }) {
  const [title,    setTitle]    = useState('');
  const [ageGroup, setAgeGroup] = useState('Alla åldrar');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => { if (!title.trim()) return; onAdd(day, { title: title.trim(), ageGroup }); };

  return (
    <div className="mt-1 rounded-xl p-2 flex flex-col gap-1.5 shadow-md"
      style={{ background: 'rgba(99,102,241,0.07)', border: '1.5px solid rgba(99,102,241,0.25)' }}>
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Namn på aktiviteten…"
        className="text-xs font-semibold text-slate-900 bg-white rounded-lg px-2 py-1.5 outline-none border border-indigo-200 focus:border-indigo-500 w-full shadow-sm"
      />
      <select
        value={ageGroup}
        onChange={e => setAgeGroup(e.target.value)}
        className="text-[11px] text-slate-600 bg-white rounded-lg px-2 py-1 outline-none border border-indigo-200 w-full"
      >
        {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
      </select>
      <div className="flex gap-1.5">
        <button
          onClick={submit}
          disabled={!title.trim()}
          className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold disabled:opacity-40 transition"
        >
          ✓ Lägg till
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] font-medium hover:bg-slate-50 transition"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, pushHistory,
  onOpenAsset,
}) {
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [dragActId,      setDragActId]      = useState(null);
  const [dragOverDay,    setDragOverDay]    = useState(null);
  const [quickAddDay,    setQuickAddDay]    = useState(null);

  const allDays    = getDaysInMonth(year, month);
  const firstDow   = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDow + allDays.length) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDow + 1;
    const date   = new Date(year, month, dayNum);
    const outside = dayNum < 1 || dayNum > allDays.length;
    return { date, outside };
  });

  // Alla klickbara dagar inkl. spilldagar
  const activeDays = cells
    .map(c => c.date)
    .filter(d => openDays.includes(d.getDay()));

  const sortedActivities = sortByDate(activities);

  const addActivity = useCallback((date, patch = {}) => {
    const newAct = {
      id:          crypto.randomUUID(),
      date:        date ?? activeDays[0] ?? new Date(),
      title:       patch.title       ?? '',
      description: patch.description ?? '',
      ageGroup:    patch.ageGroup    ?? 'Alla åldrar',
      image:       patch.image       ?? DEFAULT_IMG,
      badges:      patch.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
      ...patch,
    };
    pushHistory(sortByDate([...activities, newAct]));
    setQuickAddDay(null);
  }, [activities, activeDays, pushHistory]);

  const removeActivity = useCallback((id) => {
    pushHistory(activities.filter(a => a.id !== id));
  }, [activities, pushHistory]);

  // FIX #5 — drag-drop sorterar om listan efteråt
  const handleDropOnDay = useCallback((day) => {
    if (!dragActId || !day) return;
    const next = sortByDate(
      activities.map(a => a.id === dragActId ? { ...a, date: day } : a)
    );
    pushHistory(next);
    setDragActId(null);
    setDragOverDay(null);
  }, [dragActId, activities, pushHistory]);

  const handleMagicImport = useCallback((parsed) => {
    const safeActiveDays = activeDays.length > 0 ? activeDays : [new Date(year, month, 1)];
    const newOnes = parsed.map((p, i) => ({
      id:          crypto.randomUUID(),
      date:        safeActiveDays[i % safeActiveDays.length],
      title:       p.title       || 'Importerad aktivitet',
      description: p.description || '',
      ageGroup:    p.ageGroup    || 'Alla åldrar',
      image:       DEFAULT_IMG,
      badges:      p.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
    }));
    pushHistory(sortByDate([...activities, ...newOnes]));
    setShowMagicPaste(false);
  }, [activities, activeDays, year, month, pushHistory]);

  const activitiesOnDay = (day) =>
    activities.filter(a => toISO(a.date) === toISO(day));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-slate-900 text-sm w-36 text-center">
            {MONTH_SV[month]} {year}
          </span>
          <button onClick={nextMonth} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-1">
          {WEEKDAY_SV.map((d, i) => (
            <button
              key={i}
              onClick={() => setOpenDays(prev =>
                prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
              )}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                openDays.includes(i)
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowMagicPaste(true)}
          className="btn-ai h-10 px-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"
        >
          <Wand2 size={15} /> Magic Paste
        </button>
        <button
          onClick={() => {
            const firstOpen = activeDays[0] ?? allDays[0];
            setQuickAddDay(toISO(firstOpen));
          }}
          className="btn-primary h-10 px-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Ny aktivitet
        </button>
      </div>

      {/* KALENDERRUTNÄT */}
      <div className="glass rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAY_SV.map((d, i) => (
            <div key={i} className={`py-2 text-center text-xs font-bold tracking-widest uppercase ${
              openDays.includes(i) ? 'text-indigo-600' : 'text-slate-300'
            }`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map(({ date: day, outside }, i) => {
            const isOpen      = openDays.includes(day.getDay());
            const isToday     = toISO(day) === toISO(new Date());
            const isCurrMonth = day.getMonth() === month;
            const dayActs     = activitiesOnDay(day);
            const isDragOver  = dragActId && dragOverDay === toISO(day);
            const showQuick   = quickAddDay === toISO(day);

            return (
              <div
                key={i}
                onDragOver={e => { e.preventDefault(); setDragOverDay(toISO(day)); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={() => handleDropOnDay(day)}
                className={`day-cell min-h-[120px] border-b border-r border-slate-100/80 p-2 flex flex-col transition-colors group ${
                  isDragOver   ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' :
                  outside      ? 'bg-slate-50/60' :
                  isOpen       ? 'bg-white hover:bg-indigo-50/20' :
                                 'bg-slate-50/40'
                }`}
                style={{ animationDelay: `${i * 10}ms` }}
              >
                {/* Dag-nummer */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday       ? 'bg-indigo-600 text-white shadow-md' :
                    !isCurrMonth  ? 'text-slate-300' :
                    isOpen        ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {day.getDate()}
                  </span>

                  <div className="flex items-center gap-1">
                    {outside && (
                      <span className="text-[8px] text-slate-300 font-semibold">
                        {MONTH_SV[day.getMonth()].slice(0,3).toUpperCase()}
                      </span>
                    )}
                    {isOpen && (
                      <button
                        onClick={() => setQuickAddDay(toISO(day) === quickAddDay ? null : toISO(day))}
                        className="h-5 w-5 rounded-md bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Plus size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Aktivitetschips */}
                {dayActs.map(a => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={() => setDragActId(a.id)}
                    onDragEnd={() => { setDragActId(null); setDragOverDay(null); }}
                  >
                    <ActivityChip
                      a={a}
                      onUpdate={updateActivity}
                      onRemove={removeActivity}
                      onOpenAsset={onOpenAsset}
                    />
                  </div>
                ))}

                {/* Snabbformulär */}
                {showQuick && (
                  <QuickAddForm
                    day={day}
                    onAdd={addActivity}
                    onCancel={() => setQuickAddDay(null)}
                  />
                )}

                {/* Tom dag-hint */}
                {isOpen && !showQuick && dayActs.length === 0 && (
                  <button
                    onClick={() => setQuickAddDay(toISO(day))}
                    className="mt-auto text-[10px] text-slate-300 hover:text-indigo-500 flex items-center gap-1 transition py-0.5"
                  >
                    <Plus size={9} /> lägg till
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AKTIVITETSLISTA */}
      {sortedActivities.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Aktiviteter denna period — {sortedActivities.length} st
          </h3>
          <div className="flex flex-col gap-2">
            {sortedActivities.map(a => (
              <div key={a.id} className="group/card glass rounded-2xl shadow-sm flex gap-3 p-3 items-start hover:shadow-md transition">

                {/* Bild */}
                <div className="relative w-20 h-[72px] rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  {a.image && (
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => onOpenAsset(a.id)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-lg bg-white/90 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  >
                    <ImageIcon size={11} />
                  </button>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="absolute top-1 left-1 h-6 w-6 rounded-lg bg-red-500 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>

                {/* Detaljer */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  {/* Datum + åldersgrupp */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={toISO(a.date)}
                      onChange={e => {
                        const next = sortByDate(
                          activities.map(x =>
                            x.id === a.id ? { ...x, date: new Date(e.target.value + 'T12:00:00') } : x
                          )
                        );
                        pushHistory(next);
                      }}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2 py-1 outline-none border border-indigo-100 cursor-pointer transition"
                    >
                      {activeDays.map(d => (
                        <option key={toISO(d)} value={toISO(d)}>
                          {WEEKDAY_FULL[d.getDay()]} {d.getDate()} {MONTH_SV[d.getMonth()].slice(0,3)}
                          {d.getMonth() !== month ? ` (${MONTH_SV[d.getMonth()]})` : ''}
                        </option>
                      ))}
                    </select>
                    <select
                      value={a.ageGroup || 'Alla åldrar'}
                      onChange={e => updateActivity(a.id, { ageGroup: e.target.value })}
                      className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1 outline-none transition"
                    >
                      {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
                    </select>
                  </div>

                  {/* FIX #1 — Titel med synlig bakgrund och tydlig stil */}
                  <input
                    value={a.title ?? ''}
                    onChange={e => updateActivity(a.id, { title: e.target.value })}
                    className="font-bold text-sm text-slate-900 w-full px-2 py-1 rounded-lg outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-300 transition placeholder:text-slate-300"
                    placeholder="Aktivitetens namn…"
                  />

                  {/* FIX #7 — description ?? '' förhindrar undefined */}
                  <textarea
                    value={a.description ?? ''}
                    onChange={e => updateActivity(a.id, { description: e.target.value })}
                    className="w-full text-xs text-slate-500 px-2 py-1 rounded-lg outline-none border border-transparent bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-200 resize-none transition placeholder:text-slate-300"
                    rows={2}
                    placeholder="Kort beskrivning (valfritt)…"
                  />

                  {/* Badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => updateActivity(a.id, { badges: { ...a.badges, [k]: !a.badges?.[k] } })}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border transition ${
                          a.badges?.[k]
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
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

      {showMagicPaste && (
        <MagicPasteModal
          onImport={handleMagicImport}
          onClose={() => setShowMagicPaste(false)}
        />
      )}
    </div>
  );
}
