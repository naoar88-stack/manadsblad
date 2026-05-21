import { useState, useEffect, useMemo } from 'react';

const WEEKDAY_SV   = ['Sön','Mån','Tis','Ons','Tors','Fre','Lör'];
const MONTH_SV     = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const IMAGE_POOL   = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
];
const AGE_GROUPS   = ['10–12 år','13–15 år','16–18 år','Mix'];

function buildActivities(monthKey, openDays) {
  const [y, m] = monthKey.split('-').map(Number);
  const month  = m - 1;
  const date   = new Date(y, month, 1);
  const result = [];
  let idx = 0;
  while (date.getMonth() === month) {
    if (openDays.includes(date.getDay())) {
      result.push({
        id: `${monthKey}-${date.getDate()}`,
        date: new Date(date),
        title: `${WEEKDAY_SV[date.getDay()]}aktivitet ${idx + 1}`,
        description: 'Drop-in, spel, skapande och gemensam aktivitet.',
        ageGroup: AGE_GROUPS[idx % AGE_GROUPS.length],
        badges: { signup: idx % 2 === 0, cost: idx % 3 === 0, trip: idx % 4 === 0 },
        image: IMAGE_POOL[idx % IMAGE_POOL.length],
        crop: { x: 50, y: 50, zoom: 1 },
      });
      idx++;
    }
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export function useSchedule(monthKey, openDays) {
  const [activities, setActivities] = useState(() => buildActivities(monthKey, openDays));
  const [templates,  setTemplates]  = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);

  useEffect(() => {
    setActivities(buildActivities(monthKey, openDays));
  }, [monthKey, openDays.join(',')]);

  const schedule = useMemo(() => {
    const map = {};
    activities.forEach(a => { map[a.date.getDate()] = a; });
    return map;
  }, [activities]);

  const addTemplate = (t) => setTemplates(prev => [...prev, t]);

  return { schedule, activities, setActivities, templates, addTemplate, isLoading };
}
