import { useState, useEffect, useRef, useMemo } from 'react';

export function useSchedule(monthKey, openDays) {
  const [activitiesMap, setActivitiesMap] = useState({});
  const [templates, setTemplates]         = useState([]);
  const prevMonthKey = useRef(monthKey);

  // Öppna ny månad som TOM (inga auto-genererade demoaktiviteter)
  useEffect(() => {
    if (prevMonthKey.current !== monthKey) {
      prevMonthKey.current = monthKey;
    }
    setActivitiesMap(prev => {
      if (prev[monthKey] !== undefined) return prev;
      return { ...prev, [monthKey]: [] }; // ← tom lista, inga seeds
    });
  }, [monthKey]);

  const activities = activitiesMap[monthKey] ?? [];

  const setActivities = (newActs) => {
    const updated = typeof newActs === 'function' ? newActs(activities) : newActs;
    setActivitiesMap(prev => ({ ...prev, [monthKey]: updated }));
  };

  // Aktiviteter sparas alltid med den månadsnyckel som matchar deras faktiska datum
  // så att spilldagar överlever månadsbyte
  const setActivitiesGlobal = (acts) => {
    setActivitiesMap(prev => {
      const next = { ...prev };
      acts.forEach(a => {
        const d   = a.date instanceof Date ? a.date : new Date(a.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
        if (!next[key]) next[key] = [];
        if (!next[key].find(x => x.id === a.id)) {
          next[key] = [...next[key], a];
        } else {
          next[key] = next[key].map(x => x.id === a.id ? a : x);
        }
      });
      return next;
    });
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

  return {
    schedule,
    activities,
    setActivities,
    setActivitiesGlobal,
    activitiesMap,
    setActivitiesMap,
    templates,
    addTemplate,
  };
}
