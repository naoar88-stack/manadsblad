import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, GripVertical, ChevronUp, ChevronDown, Wand2, Image as ImageIcon, Cloud, History } from 'lucide-react';

const MONTH_SV   = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const WEEKDAY_SV = ['Sön','Mån','Tis','Ons','Tors','Fre','Lör'];
const AGE_GROUPS = ['10–12 år','13–15 år','16–18 år','Mix'];
const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
];

function formatDate(d) {
  return `${WEEKDAY_SV[d.getDay()]} ${d.getDate()} ${MONTH_SV[d.getMonth()].slice(0,3)}`;
}

function DayRow({ activity, index, total, onUpdate, onMove, onOpenAsset, dragHandlers }) {
  const toggleBadge = (key) => onUpdate(activity.id, { badges: { ...activity.badges, [key]: !activity.badges[key] } });
  const sharpen = () => onUpdate(activity.id, {
    title: activity.title.includes('🔥') ? activity.title : `${activity.title} 🔥`,
    description: `Missa inte ${activity.title.toLowerCase()} – en maxad kväll med energi, gemenskap och riktigt bra vibes.`,
  });

  return (
    <div
      className="rounded-[24px] bg-white border border-slate-200/80 shadow-[0_6px_24px_rgba(15,23,42,0.06)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.09)]"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDrop={(e) => dragHandlers.onDrop(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_136px] gap-4 items-start">
        {/* Controls */}
        <div className="flex lg:flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex lg:flex-col gap-2">
            <button onClick={() => onMove(index, -1)} disabled={index === 0} className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-30"><ChevronUp className="w-4 h-4 mx-auto" /></button>
            <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-30"><ChevronDown className="w-4 h-4 mx-auto" /></button>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{formatDate(activity.date)}</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">Vecka {Math.ceil(activity.date.getDate() / 7)}</span>
          </div>
          <input
            value={activity.title}
            onChange={e => onUpdate(activity.id, { title: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-200 mb-3"
            placeholder="Aktivitetens namn…"
          />
          <textarea
            value={activity.description}
            onChange={e => onUpdate(activity.id, { description: e.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Kort beskrivning…"
          />
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button onClick={sharpen} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
              <Wand2 className="w-3.5 h-3.5" />Vässa
            </button>
            {AGE_GROUPS.map(g => (
              <button
                key={g}
                onClick={() => onUpdate(activity.id, { ageGroup: g })}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  activity.ageGroup === g
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >{g}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[['signup','Anmälan'],['cost','Kostnad'],['trip','Utflykt']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleBadge(key)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  activity.badges[key] ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Image thumb */}
        <button
          onClick={() => onOpenAsset(activity.id)}
          className="w-full aspect-square rounded-[22px] overflow-hidden border border-slate-200 relative group bg-slate-100"
        >
          <img
            src={activity.image} alt={activity.title}
            className="w-full h-full object-cover transition"
            style={{ objectPosition: `${activity.crop.x}% ${activity.crop.y}%`, transform: `scale(${activity.crop.zoom})` }}
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-end p-3">
            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-xs font-semibold opacity-0 group-hover:opacity-100 transition">Byt bild</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export function SchemaView({ year, month, prevMonth, nextMonth, openDays, setOpenDays, activities, updateActivity, moveActivity, reorderActivities, onOpenAsset, pushHistory }) {
  const [fixedActivities, setFixedActivities] = useState({ 3: 'Matlagning & fika', 4: 'Kreativt skapande', 5: 'Turnering & häng' });
  const [magicText, setMagicText] = useState('Onsdag: Tjejkväll med tacos\nTorsdag: FIFA-turnering\nFredag: Utflykt till klätterhallen, anmälan krävs');
  const dragIndex = useRef(null);

  const dragHandlers = {
    onDragStart: (e, i) => { dragIndex.current = i; e.dataTransfer.effectAllowed = 'move'; },
    onDragOver:  (e, i) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
    onDrop:      (e, i) => { e.preventDefault(); if (dragIndex.current !== null && dragIndex.current !== i) reorderActivities(dragIndex.current, i); dragIndex.current = null; },
    onDragEnd:   ()     => { dragIndex.current = null; },
  };

  const applyMagic = () => {
    const lines = magicText.split('\n').map(l => l.trim()).filter(Boolean);
    const next = activities.map((a, idx) => {
      const [left, right] = (lines[idx % lines.length] || '').split(':');
      return { ...a, title: right ? right.trim() : left, description: `AI-tolkad text för ${formatDate(a.date).toLowerCase()}.` };
    });
    pushHistory(next);
  };

  const fillAiImages = () => {
    const next = activities.map((a, i) => ({ ...a, image: IMAGE_POOL[(i + 2) % IMAGE_POOL.length] }));
    pushHistory(next);
  };

  return (
    <div className="max-w-screen-2xl mx-auto grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-5">
      {/* LEFT – Månadsväljare & Fasta aktiviteter */}
      <aside className="space-y-4">
        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Månad & dagar</h2>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 mb-5">
            <button onClick={prevMonth} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-center">
              <div className="font-bold text-slate-900">{MONTH_SV[month]}</div>
              <div className="text-sm text-slate-500">{year}</div>
            </div>
            <button onClick={nextMonth} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="mb-1 text-sm font-medium text-slate-700">Öppna veckodagar</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Sön','Mån','Tis','Ons','Tors','Fre','Lör'].map((label, i) => (
              <button
                key={i}
                onClick={() => setOpenDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort())}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                  openDays.includes(i) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Fasta aktiviteter</h2>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Applicera</button>
          </div>
          <div className="space-y-3">
            {openDays.map(d => (
              <div key={d}>
                <label className="text-xs uppercase tracking-wide text-slate-500">{WEEKDAY_SV[d]}</label>
                <textarea
                  value={fixedActivities[d] || ''}
                  onChange={e => setFixedActivities(p => ({ ...p, [d]: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER – Kalenderlistan */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kalenderlista</h2>
            <p className="text-sm text-slate-500">Dra-och-släpp för att flytta · AI-copy · bild per dag</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl font-medium">{activities.length} tillfällen</span>
        </div>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <DayRow
              key={activity.id}
              activity={activity}
              index={index}
              total={activities.length}
              onUpdate={updateActivity}
              onMove={moveActivity}
              onOpenAsset={onOpenAsset}
              dragHandlers={dragHandlers}
            />
          ))}
        </div>
      </section>

      {/* RIGHT – AI-assistent */}
      <aside className="space-y-4">
        <div className="bg-white/80 backdrop-blur rounded-[28px] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">AI-assistent</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Magic Paste, smart copy och batchbilder.</p>

          <div className="rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 mb-4">
            <div className="text-sm font-semibold text-indigo-700 mb-2">Skapa schema från text</div>
            <textarea
              value={magicText}
              onChange={e => setMagicText(e.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button onClick={applyMagic} className="mt-3 w-full px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition">
              Magic Paste → Fyll kalender
            </button>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <ImageIcon className="w-4 h-4 text-slate-700" />Fyll med AI-bilder
            </div>
            <p className="text-xs text-slate-500 mb-3">Skapar relevanta bilder via Imagen 4 baserat på rubriken.</p>
            <button onClick={fillAiImages} className="w-full px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition">
              Generera batchbilder
            </button>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <Cloud className="w-4 h-4 text-slate-700" />Status
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2 items-start"><History className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Historik med Undo/Redo (Ctrl+Z/Y)</li>
              <li className="flex gap-2 items-start"><Cloud className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Firestore autosave (debounced)</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
