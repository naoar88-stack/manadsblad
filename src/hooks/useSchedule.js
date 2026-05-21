import { useState, useEffect, useRef, useMemo } from 'react';

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
];
const AGE_GROUPS = ['10-12 ar', '13-15 ar', '16-18 ar', 'Mix'];

function buildSeedActivities(monthKey, openDays) {
  const [y, m] = monthKey.split('-').map(Number);
  const month = m - 1;
  const date = new Date(y, month, 1);
  const result = [];
  let idx = 0;
  while (date.getMonth() === month) {
    if (openDays.includes(date.getDay())) {
      result.push({
        id: `${monthKey}-${date.getDate()}`,
        date: new Date(date),
        title: `Aktivitet ${idx + 1}`,
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
  // aktiviteter per manadsnyckel — bevaras vid manadsbyten
  const [activitiesMap, setActivitiesMap] = useState(() => ({
    [monthKey]: buildSeedActivities(monthKey, openDays),
  }));
  const [templates, setTemplates] = useState([]);
  const prevMonthKey = useRef(monthKey);

  // Nar en ny manad oppnas for forsta gangen — generera standardaktiviteter
  useEffect(() => {
    if (prevMonthKey.current !== monthKey) {
      prevMonthKey.current = monthKey;
    }
    setActivitiesMap(prev => {
      if (prev[monthKey]) return prev; // finns redan — rora inte
      return { ...prev, [monthKey]: buildSeedActivities(monthKey, openDays) };
    });
  }, [monthKey]); // avsiktligt bara monthKey

  const activities = activitiesMap[monthKey] ?? [];

  const setActivities = (newActs) => {
    const updated = typeof newActs === 'function' ? newActs(activities) : newActs;
    setActivitiesMap(prev => ({ ...prev, [monthKey]: updated }));
  };

  const schedule = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      const d = a.date instanceof Date ? a.date : new Date(a.date);
      map[d.getDate()] = a;
    });
    return map;
  }, [activities]);

  const addTemplate = (t) => setTemplates(prev => [...prev, t]);

  return { schedule, activities, setActivities, activitiesMap, setActivitiesMap, templates, addTemplate };
}
