import React, { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Sparkles, ImageIcon, Trash2, Wand2 } from 'lucide-react';
import { MagicPasteModal } from './MagicPasteModal';
import { VassaButton }     from './VassaButton';

const MONTH_SV   = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
const WEEKDAY_FULL = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
const AGE_GROUPS = ['10–12 år','13–15 år','16–18 år','Alla åldrar','Personal'];
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

export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, moveActivity, reorderActivities, pushHistory,
  onOpenAsset,
}) {
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [dragActId, setDragActId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const allDays    = getDaysInMonth(year, month);
  const activeDays = allDays.filter(d => openDays.includes(d.getDay()));

  // Bygg veckogrupper för kalenderrutnät
  const firstDow  = new Date(year, month, 1).getDay(); // 0=sön
  const totalCells = Math.ceil((firstDow + allDays.length) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDow + 1;
    if (dayNum < 1 || dayNum > allDays.length) return null;
    return allDays[dayNum - 1];
  });

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
    pushHistory([...activities, newAct]);
  }, [activities, activeDays, pushHistory]);

  const removeActivity = useCallback((id) => {
    pushHistory(activities.filter(a => a.id !== id));
  }, [activities, pushHistory]);

  const handleMagicImport = useCallback((parsed) => {
    const newOnes = parsed.map((p, i) => ({
      id:          crypto.randomUUID(),
      date:        activeDays[i % Math.max(activeDays.length,1)] ?? new Date(),
      title:       p.title       || 'Importerad aktivitet',
      description: p.description || '',
      ageGroup:    p.ageGroup    || 'Alla åldrar',
      image:       DEFAULT_IMG,
      badges:      p.badges ?? { signup: false, cost: false, trip: false },
      crop:        { x: 50, y: 50, zoom: 1 },
    }));
    pushHistory([...activities, ...newOnes]);
    setShowMagicPaste(false);
  }, [activities, activeDays, pushHistory]);

  // Dra aktivitet till dag i kalendern
  const handleDropOnDay = (day) => {
    if (!dragActId || !day) return;
    updateActivity(dragActId, { date: day });
    setDragActId(null); setDragOverDay(null);
  };

  const activitiesOnDay = (day) =>
    activities.filter(a => toISO(a.date) === toISO(day));

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Månadsnavigering */}
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="h-10 w-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h2 className="text-xl font-extrabold text-slate-900 min-w-[180px] text-center">
            {MONTH_SV[month]} {year}
          </h2>
          <button onClick={nextMonth} className="h-10 w-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Öppna dagar */}
        <div className="flex gap-1">
          {WEEKDAY_SV.map((d, i) => (
            <button key={i}
              onClick={() => setOpenDays(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev,i])}
              className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                openDays.includes(i) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>{d}</button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowMagicPaste(true)} className="h-10 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />Magic Paste
          </button>
          <button onClick={() => addActivity(activeDays[0])} className="h-10 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />Ny aktivitet
          </button>
        </div>
      </div>

      {/* KALENDERRUTNÄT */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-white shadow-sm overflow-hidden">
        {/* Veckodagsrubriker */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAY_SV.map((d, i) => (
            <div key={i} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
              openDays.includes(i) ? 'text-indigo-600' : 'text-slate-400'
            }`}>{d}</div>
          ))}
        </div>

        {/* Dagceller */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isOpen   = day && openDays.includes(day.getDay());
            const isToday  = day && toISO(day) === toISO(new Date());
            const dayActs  = day ? activitiesOnDay(day) : [];
            const isDragTarget = day && dragActId && dragOverDay === toISO(day);

            return (
              <div
                key={i}
                onDragOver={e => { e.preventDefault(); day && setDragOverDay(toISO(day)); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={() => handleDropOnDay(day)}
                className={`min-h-[110px] border-b border-r border-slate-100 p-2 flex flex-col transition-colors ${
                  !day ? 'bg-slate-50' :
                  isDragTarget ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' :
                  isOpen ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/60'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' :
                        isOpen  ? 'text-slate-800' : 'text-slate-400'
                      }`}>{day.getDate()}</span>
                      {isOpen && (
                        <button
                          onClick={() => addActivity(day)}
                          className="h-6 w-6 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 opacity-0 hover:opacity-100 group-hover:opacity-100 transition"
                        ><Plus className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    {/* Aktiviteter på dagen */}
                    <div className="flex flex-col gap-1 flex-1">
                      {dayActs.map(a => (
                        <div
                          key={a.id}
                          draggable
                          onDragStart={() => setDragActId(a.id)}
                          onDragEnd={() => { setDragActId(null); setDragOverDay(null); }}
                          className="group/chip relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                        >
                          {/* Miniatyr med bild */}
                          {a.image && (
                            <div className="relative h-12 w-full overflow-hidden">
                              <img src={a.image} alt="" className="w-full h-full object-cover"
                                style={{ objectPosition: `${a.crop?.x??50}% ${a.crop?.y??50}%` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {/* Bildknapp */}
                              <button
                                onClick={(e) => { e.stopPropagation(); onOpenAsset(a.id); }}
                                className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/80 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
                              ><ImageIcon className="w-3 h-3 text-slate-700" /></button>
                              <span className="absolute bottom-1 left-1.5 right-6 text-[10px] font-bold text-white truncate">{a.title}</span>
                              {/* Radera */}
                              <button
                                onClick={(e) => { e.stopPropagation(); removeActivity(a.id); }}
                                className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500/80 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition"
                              ><Trash2 className="w-2.5 h-2.5 text-white" /></button>
                            </div>
                          )}
                          {!a.image && (
                            <div className="bg-indigo-100 rounded-lg px-2 py-1 text-[10px] font-semibold text-indigo-700 truncate flex justify-between">
                              <span>{a.title}</span>
                              <button onClick={(e)=>{ e.stopPropagation(); removeActivity(a.id); }}>
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {/* + knapp i öppen dag */}
                      {isOpen && (
                        <button
                          onClick={() => addActivity(day)}
                          className="mt-auto text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition py-0.5"
                        ><Plus className="w-3 h-3" />Lägg till</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AKTIVITETSLISTA — detaljer under kalendern */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Aktiviteter denna månad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activities.map((a) => (
              <div key={a.id} className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
                {/* Bild */}
                <div className="relative h-36 overflow-hidden group/card">
                  <img src={a.image || DEFAULT_IMG} alt={a.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `${a.crop?.x??50}% ${a.crop?.y??50}%` }} />
                  <button
                    onClick={() => onOpenAsset(a.id)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-white/90 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  ><ImageIcon className="w-4 h-4 text-slate-700" /></button>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="absolute top-2 left-2 h-8 w-8 rounded-xl bg-red-500 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition shadow"
                  ><Trash2 className="w-4 h-4 text-white" /></button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={toISO(a.date)}
                      onChange={e => updateActivity(a.id, { date: new Date(e.target.value) })}
                      className="text-xs font-semibold text-indigo-600 bg-transparent outline-none flex-1 truncate"
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
                    >{AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}</select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={a.title}
                      onChange={e => updateActivity(a.id, { title: e.target.value })}
                      className="flex-1 font-bold text-sm text-slate-900 bg-transparent outline-none"
                    />
                    <VassaButton activity={a} onUpdate={patch => updateActivity(a.id, patch)} />
                  </div>
                  <textarea
                    value={a.description}
                    onChange={e => updateActivity(a.id, { description: e.target.value })}
                    className="w-full text-xs text-slate-500 bg-transparent outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex gap-1.5">
                    {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([k,l]) => (
                      <button key={k}
                        onClick={() => updateActivity(a.id, { badges: { ...a.badges, [k]: !a.badges?.[k] } })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition ${
                          a.badges?.[k] ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMagicPaste && (
        <MagicPasteModal onImport={handleMagicImport} onClose={() => setShowMagicPaste(false)} />
      )}
    </div>
  );
}
