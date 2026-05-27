import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Wand2, ImageIcon, Trash2, Check, X } from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';

const MONTH_SV    = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV  = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL= ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
const AGE_GROUPS  = ['10–12 år','13–15 år','16–18 år','Alla åldrar','Personal'];
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1541710430735-5f8f156ef0e6?w=600&q=80';

function getDaysInMonth(year, month) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}
function toISO(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().split('T')[0];
}
function sortByDate(arr) {
  return [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ── Inline-redigering direkt i kalenderchipsen ── */
function ActivityChip({ a, onUpdate, onRemove, onOpenAsset }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(a.title);
  const inputRef              = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const confirm = () => { onUpdate(a.id, { title: draft.trim() || 'Ny aktivitet' }); setEditing(false); };
  const cancel  = () => { setDraft(a.title); setEditing(false); };

  return (
    <div
      draggable={!editing}
      className="group/chip relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ marginBottom: 4 }}
    >
      {a.image && (
        <div className="relative">
          <img src={a.image} alt={a.title} className="w-full object-cover" style={{ height: 44, display: 'block' }} />
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onOpenAsset(a.id); }}
            className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/80 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
          >
            <ImageIcon size={11} />
          </button>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onRemove(a.id); }}
            className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500/80 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
          >
            <Trash2 size={9} className="text-white" />
          </button>
        </div>
      )}
      <div className="bg-white px-2 py-1.5 flex items-center gap-1 min-h-[28px]">
        {editing ? (
          <>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); }}
              className="flex-1 text-[11px] font-semibold text-slate-900 outline-none bg-indigo-50 rounded px-1"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={confirm} className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center shrink-0"><Check size={9} className="text-white" /></button>
            <button onClick={cancel}  className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center shrink-0"><X size={9} /></button>
          </>
        ) : (
          <span
            onClick={() => setEditing(true)}
            className="flex-1 text-[11px] font-semibold text-slate-900 truncate cursor-text hover:text-indigo-600 transition"
            title="Klicka för att redigera"
          >
            {a.title}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Snabbformulär i kalendercellen ── */
function QuickAddForm({ day, activeDays, onAdd, onCancel }) {
  const [title,    setTitle]    = useState('');
  const [ageGroup, setAgeGroup] = useState('Alla åldrar');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => { if (!title.trim()) return; onAdd(day, { title: title.trim(), ageGroup }); };

  return (
    <div className="mt-1 bg-indigo-50 border border-indigo-200 rounded-xl p-2 flex flex-col gap-1.5 shadow-sm">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Aktivitetens namn…"
        className="text-xs font-semibold text-slate-900 bg-white rounded-lg px-2 py-1.5 outline-none border border-indigo-200 focus:border-indigo-400 w-full"
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
          className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold disabled:opacity-40 transition"
        >
          Lägg till
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-medium transition hover:bg-slate-50"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

/* ── HUVUDKOMPONENT ── */
export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, moveActivity, reorderActivities, pushHistory,
  onOpenAsset,
}) {
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [dragActId,      setDragActId]      = useState(null);
  const [dragOverDay,    setDragOverDay]    = useState(null);
  const [quickAddDay,    setQuickAddDay]    = useState(null);

  const allDays    = getDaysInMonth(year, month);
  const activeDays = allDays.filter(d => openDays.includes(d.getDay()));

  const firstDow   = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDow + allDays.length) / 7) * 7;
  const cells      = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDow + 1;
    if (dayNum < 1 || dayNum > allDays.length) return null;
    return allDays[dayNum - 1];
  });

  const sortedActivities = sortByDate(activities);

  const addActivity = useCallback((date, patch = {}) => {
    const newAct = {
      id:          crypto.randomUUID(),
      date:        date ?? activeDays[0] ?? new Date(),
      title:       patch.title       ?? 'Ny aktivitet',
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

  const handleMagicImport = useCallback((parsed) => {
    const newOnes = parsed.map((p, i) => ({
      id:          crypto.randomUUID(),
      date:        activeDays[i % Math.max(activeDays.length, 1)] ?? new Date(),
      title:       p.title       || 'Importerad aktivitet',
      description: p.description || '',
      ageGroup:    p.ageGroup    || 'Alla åldrar',
      image:       DEFAULT_IMG,
      badges:      p.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
    }));
    pushHistory(sortByDate([...activities, ...newOnes]));
    setShowMagicPaste(false);
  }, [activities, activeDays, pushHistory]);

  const handleDropOnDay = (day) => {
    if (!dragActId || !day) return;
    updateActivity(dragActId, { date: day });
    setDragActId(null);
    setDragOverDay(null);
  };

  const activitiesOnDay = (day) => activities.filter(a => toISO(a.date) === toISO(day));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3 py-2">
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
              onClick={() => setOpenDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                openDays.includes(i)
                  ? 'bg-slate-900 text-white'
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
          className="h-10 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 transition"
        >
          <Wand2 size={15} /> Magic Paste
        </button>
        <button
          onClick={() => addActivity(activeDays[0] ?? allDays[0])}
          className="h-10 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2 transition"
        >
          <Plus size={15} /> Ny aktivitet
        </button>
      </div>

      {/* KALENDERRUTNÄT */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAY_SV.map((d, i) => (
            <div key={i} className={`py-2 text-center text-xs font-bold tracking-widest uppercase ${openDays.includes(i) ? 'text-indigo-600' : 'text-slate-300'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isOpen       = day && openDays.includes(day.getDay());
            const isToday      = day && toISO(day) === toISO(new Date());
            const dayActs      = day ? activitiesOnDay(day) : [];
            const isDragTarget = day && dragActId && dragOverDay === toISO(day);
            const showQuick    = day && quickAddDay === toISO(day);

            return (
              <div
                key={i}
                onDragOver={e => { e.preventDefault(); day && setDragOverDay(toISO(day)); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={() => handleDropOnDay(day)}
                className={`min-h-[120px] border-b border-r border-slate-100 p-2 flex flex-col transition-colors group ${
                  !day          ? 'bg-slate-50' :
                  isDragTarget  ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' :
                  isOpen        ? 'bg-white hover:bg-slate-50/60' :
                                  'bg-slate-50/60'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-indigo-600 text-white' : isOpen ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {day.getDate()}
                      </span>
                      {isOpen && (
                        <button
                          onClick={() => setQuickAddDay(toISO(day) === quickAddDay ? null : toISO(day))}
                          className="h-6 w-6 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </div>

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

                    {showQuick && (
                      <QuickAddForm
                        day={day}
                        activeDays={activeDays}
                        onAdd={addActivity}
                        onCancel={() => setQuickAddDay(null)}
                      />
                    )}

                    {isOpen && !showQuick && dayActs.length === 0 && (
                      <button
                        onClick={() => setQuickAddDay(toISO(day))}
                        className="mt-auto text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition py-0.5"
                      >
                        <Plus size={9} /> Lägg till
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AKTIVITETSLISTA — sorterad i datumordning */}
      {sortedActivities.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
            Aktiviteter denna månad ({sortedActivities.length} st)
          </h3>
          <div className="flex flex-col gap-3">
            {sortedActivities.map(a => (
              <div key={a.id} className="group/card bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4 p-3 items-start hover:shadow-md transition">
                <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={a.image || DEFAULT_IMG} alt={a.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => onOpenAsset(a.id)}
                    className="absolute top-1 right-1 h-7 w-7 rounded-xl bg-white/90 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  >
                    <ImageIcon size={12} />
                  </button>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="absolute top-1 left-1 h-7 w-7 rounded-xl bg-red-500 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={toISO(a.date)}
                      onChange={e => {
                        const next = sortByDate(
                          activities.map(x => x.id === a.id ? { ...x, date: new Date(e.target.value) } : x)
                        );
                        pushHistory(next);
                      }}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1 outline-none border-0 cursor-pointer"
                    >
                      {activeDays.map(d => (
                        <option key={toISO(d)} value={toISO(d)}>
                          {WEEKDAY_FULL[d.getDay()]} {d.getDate()} {MONTH_SV[d.getMonth()].slice(0,3)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={a.ageGroup}
                      onChange={e => updateActivity(a.id, { ageGroup: e.target.value })}
                      className="text-[11px] text-slate-500 bg-slate-100 rounded-lg px-2 py-1 outline-none"
                    >
                      {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
                    </select>
                  </div>

                  <input
                    value={a.title}
                    onChange={e => updateActivity(a.id, { title: e.target.value })}
                    className="font-bold text-sm text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-indigo-300 transition w-full"
                    placeholder="Aktivitetens namn"
                  />

                  <textarea
                    value={a.description}
                    onChange={e => updateActivity(a.id, { description: e.target.value })}
                    className="w-full text-xs text-slate-500 bg-transparent outline-none resize-none border-b border-transparent focus:border-indigo-200 transition"
                    rows={2}
                    placeholder="Kort beskrivning…"
                  />

                  <div className="flex gap-1.5 flex-wrap">
                    {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => updateActivity(a.id, { badges: { ...a.badges, [k]: !a.badges?.[k] } })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition ${
                          a.badges?.[k]
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
