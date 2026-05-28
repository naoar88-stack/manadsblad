import React, { useState, useCallback, useRef, useMemo } from 'react';
import { format, getDaysInMonth, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Image, Wand2, Check, X,
  GripVertical, ChevronUp, ChevronDown, AlarmClock, MapPin, Users, CalendarDays,
} from 'lucide-react';
import { useToast } from './Toast';
import { EmptyState } from './EmptyState';

export function SchemaView({
  year, month, prevMonth, nextMonth,
  openDays, setOpenDays,
  activities, updateActivity, removeActivity,
  pushHistory, onOpenAsset,
}) {
  const toast            = useToast();
  const [dragOver,  setDragOver]  = useState(null);
  const [dragItem,  setDragItem]  = useState(null);
  const [improvingText, setImprovingText] = useState({});
  const dragCounter = useRef(0);

  const monthName = useMemo(
    () => format(new Date(year, month), 'MMMM yyyy', { locale: sv }),
    [year, month],
  );

  // Bygg dagar-array en gång per år/månad
  const days = useMemo(() => {
    const daysInMonth      = getDaysInMonth(new Date(year, month));
    const firstDayOfWeek   = getDay(new Date(year, month, 1));
    const mondayFirstOffset = (firstDayOfWeek + 6) % 7;
    const arr = [];
    for (let i = 0; i < mondayFirstOffset; i++) arr.push({ day: null, isPadding: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const date      = new Date(year, month, d);
      const dayOfWeek = (date.getDay() + 6) % 7; // 0=Mån, 6=Sön
      arr.push({ day: d, date, dayOfWeek, isPadding: false });
    }
    return arr;
  }, [year, month]);

  // Aktiviteter per dag — ett enda filter-pass för hela månaden
  const activitiesByDay = useMemo(() => {
    const map = {};
    for (const a of activities) {
      const d = a.date instanceof Date ? a.date : new Date(a.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      const key = d.getDate();
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [activities, year, month]);

  const totalActivities    = useMemo(() => Object.values(activitiesByDay).reduce((s, a) => s + a.length, 0), [activitiesByDay]);
  const openDaysThisMonth  = useMemo(() => days.filter(d => !d.isPadding && openDays.includes(d.dayOfWeek)), [days, openDays]);

  // ─ Adda ny aktivitet på dag
  const addActivity = useCallback((day) => {
    const date = new Date(year, month, day).toISOString();
    const newAct = {
      id: crypto.randomUUID(),
      date,
      title: '',
      time: '',
      location: '',
      maxParticipants: '',
      image: '',
    };
    pushHistory([...activities, newAct]);
  }, [activities, pushHistory, year, month]);

  // ─ AI: Förbättra text
  const improveText = useCallback(async (id, currentTitle) => {
    if (!currentTitle?.trim()) return;
    setImprovingText(p => ({ ...p, [id]: true }));
    try {
      const res  = await fetch('/api/improve-text', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: currentTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Serverfel ${res.status}`);
      if (data.result) {
        updateActivity(id, { title: data.result.replace(/^["'`]|["'`]$/g, '').trim() });
        toast?.success('Titel förbättrad med AI ✓');
      }
    } catch (e) {
      console.error('improveText:', e);
      toast?.error(e.message || 'Kunde inte förbättra texten');
    } finally {
      setImprovingText(p => ({ ...p, [id]: false }));
    }
  }, [updateActivity, toast]);

  // ─ Drag & Drop
  const handleDragStart = useCallback((e, activity) => {
    setDragItem(activity);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((e, day) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOver(day);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) setDragOver(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragCounter.current = 0;
    setDragOver(null);
    setDragItem(null);
  }, []);

  const handleDrop = useCallback((e, day) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(null);
    if (!dragItem) return;
    const newDate = new Date(year, month, day).toISOString();
    updateActivity(dragItem.id, { date: newDate });
    setDragItem(null);
  }, [dragItem, updateActivity, year, month]);

  // ─ Toggla öppet dag
  const toggleOpenDay = useCallback((dayOfWeek) => {
    setOpenDays(prev =>
      prev.includes(dayOfWeek)
        ? prev.filter(d => d !== dayOfWeek)
        : [...prev, dayOfWeek].sort((a, b) => a - b),
    );
  }, [setOpenDays]);

  const weekdayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200 hover:shadow-sm"
            aria-label="Förra månaden"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{monthName}</h1>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200 hover:shadow-sm"
            aria-label="Nästa månad"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Veckodagstogglar */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 mr-2">Öppen dagar:</span>
          {weekdayNames.map((name, i) => (
            <button
              key={i}
              onClick={() => toggleOpenDay(i)}
              aria-pressed={openDays.includes(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                openDays.includes(i)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {openDays.length === 0 && (
        <EmptyState
          icon={<CalendarDays />}
          title="Inga öppna dagar valda"
          body="Välj vilka veckodagar fritidsgården är öppen med knapparna ovan."
          className="my-8"
        />
      )}

      {openDays.length > 0 && (
        <div className="grid grid-cols-7 gap-2">
          {weekdayNames.map((name) => (
            <div key={name} className="text-center text-xs font-semibold text-slate-400 py-2 uppercase tracking-wider">
              {name}
            </div>
          ))}

          {days.map(({ day, date, dayOfWeek, isPadding }, idx) => {
            if (isPadding) return <div key={`pad-${idx}`} className="rounded-xl" />;

            const isOpen         = openDays.includes(dayOfWeek);
            const dayActivities  = activitiesByDay[day] ?? [];
            const isToday        = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={day}
                className={`rounded-xl p-2 flex flex-col gap-1 min-h-24 transition-all ${
                  dragOver === day ? 'bg-indigo-50 border-2 border-indigo-400 shadow-md' :
                  isOpen           ? 'bg-white border border-slate-200 shadow-sm' :
                                     'bg-slate-50/60 border border-slate-100'
                }`}
                onDragOver={e => e.preventDefault()}
                onDragEnter={e => handleDragEnter(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, day)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${
                    isToday ? 'text-indigo-600 bg-indigo-100 px-2 rounded-full'
                    : isOpen ? 'text-slate-700'
                    : 'text-slate-300'
                  }`}>
                    {day}
                  </span>
                  {isOpen && (
                    <button
                      onClick={() => addActivity(day)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                      aria-label={`Lägg till aktivitet ${day} ${monthName}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {dayActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onUpdate={patch => updateActivity(activity.id, patch)}
                    onRemove={() => removeActivity(activity.id)}
                    onImprove={() => improveText(activity.id, activity.title)}
                    isImproving={improvingText[activity.id]}
                    onDragStart={e => handleDragStart(e, activity)}
                    onDragEnd={handleDragEnd}
                    onOpenAsset={onOpenAsset}
                  />
                ))}

                {isOpen && dayActivities.length === 0 && (
                  <button
                    onClick={() => addActivity(day)}
                    className="mt-auto text-xs text-slate-300 hover:text-indigo-400 transition-colors text-center py-1 rounded hover:bg-indigo-50 w-full"
                    aria-label={`Lägg till aktivitet ${day} ${monthName}`}
                  >
                    + aktivitet
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openDays.length > 0 && totalActivities === 0 && openDaysThisMonth.length > 0 && (
        <div className="mt-8 mb-4">
          <EmptyState
            icon={<CalendarDays />}
            title="Inga aktiviteter planerade"
            body={`Klicka på "+" i någon av de öppna dagarna för att lägga till din första aktivitet för ${monthName}.`}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── ActivityCard
const ActivityCard = memo(function ActivityCard({
  activity, onUpdate, onRemove, onImprove, isImproving,
  onDragStart, onDragEnd, onOpenAsset,
}) {
  const [isExpanded,        setIsExpanded]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef(null);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); setIsExpanded(v => !v); }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !activity.title) setShowDeleteConfirm(true);
  }, [activity.title]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setShowDeleteConfirm(false);
  }, []);

  return (
    <div
      className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 group cursor-grab active:cursor-grabbing transition-all hover:border-indigo-300 hover:shadow-sm"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
    >
      {showDeleteConfirm ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-600">Ta bort?</p>
          <div className="flex gap-1">
            <button
              onClick={onRemove}
              className="flex-1 py-0.5 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600"
              aria-label="Bekräfta borttagning"
            >
              <Check className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300"
              aria-label="Avbryt borttagning"
            >
              <X className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-1">
            <GripVertical className="w-3 h-3 mt-0.5 text-slate-300 flex-shrink-0" aria-hidden="true" />
            <input
              ref={titleRef}
              className="flex-1 text-xs font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
              value={activity.title}
              onChange={e => onUpdate({ title: e.target.value })}
              onKeyDown={handleTitleKeyDown}
              placeholder="Aktivitet..."
              aria-label="Aktivitetens namn"
            />
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={onImprove}
                disabled={isImproving}
                className="p-0.5 rounded hover:bg-purple-100 text-purple-500 disabled:opacity-50"
                aria-label="Förbättra med AI"
                title="Förbättra med AI"
              >
                {isImproving
                  ? <span className="text-xs animate-pulse" aria-hidden="true">♦</span>
                  : <Wand2 className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setIsExpanded(v => !v)}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                aria-label={isExpanded ? 'Fäll ihop' : 'Expandera'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-0.5 rounded hover:bg-red-100 text-red-400"
                aria-label="Ta bort aktivitet"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-2 space-y-1.5">
              {[{
                icon:        <AlarmClock className="w-3 h-3" />,
                placeholder: 'Tid (t.ex. 10:00)',
                field:       'time',
              }, {
                icon:        <MapPin className="w-3 h-3" />,
                placeholder: 'Plats',
                field:       'location',
              }, {
                icon:        <Users className="w-3 h-3" />,
                placeholder: 'Max-deltagare',
                field:       'maxParticipants',
              }].map(({ icon, placeholder, field }) => (
                <div key={field} className="flex items-center gap-1">
                  <span className="text-slate-400" aria-hidden="true">{icon}</span>
                  <input
                    className="flex-1 text-xs text-slate-600 bg-transparent outline-none placeholder:text-slate-300"
                    value={activity[field] || ''}
                    onChange={e => onUpdate({ [field]: e.target.value })}
                    placeholder={placeholder}
                    aria-label={placeholder}
                  />
                </div>
              ))}

              <button
                onClick={() => onOpenAsset(activity.id)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                aria-label={activity.image ? 'Byt aktivitetsbild' : 'Lägg till bild på aktivitet'}
              >
                <Image className="w-3 h-3" aria-hidden="true" />
                <span>{activity.image ? 'Byt bild' : 'Lägg till bild'}</span>
              </button>

              {activity.image && (
                <img
                  src={activity.image}
                  alt={`Bild för ${activity.title || 'aktivitet'}`}
                  className="w-full h-14 object-cover rounded-md mt-1"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});
