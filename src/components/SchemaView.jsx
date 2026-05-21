import React, { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Sparkles, Image, ArrowUp, ArrowDown, Wand2 } from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';
import { VassaButton }     from './VassaButton';

const MONTH_SV   = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
const AGE_GROUPS = ['10–12 år','13–15 år','16–18 år','Alla åldrar','Personal'];
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1541710430735-5f8f156ef0e6?w=600&q=80';

function getDaysInMonth(year, month) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}

function dayLabel(d) {
  return `${WEEKDAY_SV[d.getDay()]} ${d.getDate()} ${MONTH_SV[d.getMonth()].slice(0,3)}`;
}

export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, moveActivity, reorderActivities, pushHistory,
  onOpenAsset,
}) {
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [dragFrom, setDragFrom]   = useState(null);
  const [dragOver, setDragOver]   = useState(null);

  const allDays   = getDaysInMonth(year, month);
  const activeDays = allDays.filter(d => openDays.includes(d.getDay()));

  const addActivity = useCallback((patch = {}) => {
    const newAct = {
      id:          crypto.randomUUID(),
      date:        activeDays[0] ?? new Date(),
      title:       patch.title       ?? 'Ny aktivitet',
      description: patch.description ?? '',
      ageGroup:    patch.ageGroup    ?? 'Alla åldrar',
      image:       patch.image       ?? DEFAULT_IMG,
      badges:      patch.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
      ...patch,
    };
    pushHistory([...activities, newAct]);
  }, [activities, activeDays, pushHistory]);

  const handleMagicImport = useCallback((parsed) => {
    const newOnes = parsed.map((p, i) => ({
      id:          crypto.randomUUID(),
      date:        activeDays[i % activeDays.length] ?? new Date(),
      title:       p.title       || 'Importerad aktivitet',
      description: p.description || '',
      ageGroup:    p.ageGroup    || 'Alla åldrar',
      image:       DEFAULT_IMG,
      badges:      p.badges      ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
    }));
    pushHistory([...activities, ...newOnes]);
    setShowMagicPaste(false);
  }, [activities, activeDays, pushHistory]);

  // DnD
  const onDragStart = (i) => setDragFrom(i);
  const onDragEnter = (i) => setDragOver(i);
  const onDrop      = () => {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver)
      reorderActivities(dragFrom, dragOver);
    setDragFrom(null); setDragOver(null);
  };

  const DAYS_LABELS = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-4 lg:p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Månadsnavigering */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="h-11 w-11 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900 min-w-[200px] text-center">
              {MONTH_SV[month]} {year}
            </h2>
            <button onClick={nextMonth} className="h-11 w-11 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition">
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Öppna dagar */}
          <div className="flex gap-1.5">
            {DAYS_LABELS.map((d, i) => (
              <button
                key={i}
                onClick={() => setOpenDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                className={`h-10 w-10 rounded-2xl text-sm font-semibold transition ${
                  openDays.includes(i)
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >{d}</button>
            ))}
          </div>

          {/* Knappar */}
          <div className="flex gap-2">
            <button onClick={() => setShowMagicPaste(true)} className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 transition">
              <Sparkles className="w-4 h-4" />Magic Paste
            </button>
            <button onClick={() => addActivity()} className="h-11 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2 transition">
              <Plus className="w-4 h-4" />Lägg till
            </button>
          </div>
        </div>
      </div>

      {/* Aktivitetskort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activities.map((a, idx) => (
          <div
            key={a.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragEnter={() => onDragEnter(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            className={`group bg-white rounded-[28px] border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-200 overflow-hidden cursor-grab active:cursor-grabbing ${
              dragOver === idx ? 'ring-2 ring-indigo-400 scale-[1.02]' : ''
            }`}
          >
            {/* Bild */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={a.image} alt={a.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ objectPosition: `${a.crop?.x ?? 50}% ${a.crop?.y ?? 50}%`, transform: `scale(${a.crop?.zoom ?? 1})` }}
              />
              <button onClick={() => onOpenAsset(a.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center">
                <Image className="w-4 h-4 text-slate-700" />
              </button>
              {/* Badges */}
              <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                {a.badges?.signup && <span className="px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold text-slate-900">Anmälan</span>}
                {a.badges?.cost   && <span className="px-2.5 py-1 rounded-full bg-amber-400 text-[11px] font-bold text-white">Kostnad</span>}
                {a.badges?.trip   && <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-[11px] font-bold text-white">Utflykt</span>}
              </div>
            </div>

            {/* Innehåll */}
            <div className="p-4">
              {/* Datum-rad */}
              <div className="flex items-center justify-between mb-2">
                <select
                  value={a.date instanceof Date ? a.date.toISOString().split('T')[0] : ''}
                  onChange={e => updateActivity(a.id, { date: new Date(e.target.value) })}
                  className="text-xs font-semibold text-indigo-600 bg-transparent outline-none cursor-pointer max-w-[160px] truncate"
                >
                  {activeDays.map(d => (
                    <option key={d.toISOString()} value={d.toISOString().split('T')[0]}>{dayLabel(d)}</option>
                  ))}
                </select>
                <select
                  value={a.ageGroup}
                  onChange={e => updateActivity(a.id, { ageGroup: e.target.value })}
                  className="text-[11px] text-slate-500 bg-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
                </select>
              </div>

              {/* Titel */}
              <div className="flex items-start gap-2 mb-1.5">
                <input
                  value={a.title}
                  onChange={e => updateActivity(a.id, { title: e.target.value })}
                  className="flex-1 font-bold text-base text-slate-900 bg-transparent outline-none leading-tight min-w-0"
                />
                <VassaButton activity={a} onUpdate={patch => updateActivity(a.id, patch)} />
              </div>

              {/* Beskrivning */}
              <textarea
                value={a.description}
                onChange={e => updateActivity(a.id, { description: e.target.value })}
                className="w-full text-sm text-slate-500 bg-transparent outline-none resize-none leading-relaxed"
                rows={2}
              />

              {/* Badges-toggle */}
              <div className="flex gap-2 mt-3">
                {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => updateActivity(a.id, { badges: { ...a.badges, [k]: !a.badges?.[k] } })}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition border ${
                      a.badges?.[k]
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >{label}</button>
                ))}
              </div>

              {/* Sortera */}
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => moveActivity(idx, -1)} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                  <ArrowUp className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => moveActivity(idx, 1)} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                  <ArrowDown className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Tomt kort */}
        <button onClick={() => addActivity()} className="rounded-[28px] border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-3 p-8 transition-all min-h-[300px] text-slate-400 hover:text-indigo-500">
          <Plus className="w-10 h-10" />
          <span className="font-semibold text-sm">Lägg till aktivitet</span>
        </button>
      </div>

      {showMagicPaste && (
        <MagicPasteModal onImport={handleMagicImport} onClose={() => setShowMagicPaste(false)} />
      )}
    </div>
  );
}
