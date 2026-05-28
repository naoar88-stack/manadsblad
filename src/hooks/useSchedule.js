import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export function useSchedule(monthKey, openDays) {
  const [activitiesMap, setActivitiesMap] = useState({});
  const [templates, setTemplates]         = useState([]);
  const prevMonthKey = useRef(monthKey);

  useEffect(() => {
    prevMonthKey.current = monthKey;
    setActivitiesMap(prev => {
      if (prev[monthKey] !== undefined) return prev;
      return { ...prev, [monthKey]: [] };
    });
  }, [monthKey]);

  const activities = activitiesMap[monthKey] ?? [];

  // FIX: useCallback med funktionell uppdatering → aldrig stale closure
  const setActivities = useCallback((newActs) => {
    setActivitiesMap(prev => {
      const current = prev[monthKey] ?? [];
      const updated = typeof newActs === 'function' ? newActs(current) : newActs;
      return { ...prev, [monthKey]: updated };
    });
  }, [monthKey]);

  // Lagrar aktiviteter under rätt månadsnyckeln (spilldagar)
  const setActivitiesGlobal = useCallback((acts) => {
    setActivitiesMap(prev => {
      const next = { ...prev };
      acts.forEach(a => {
        const d   = a.date instanceof Date ? a.date : new Date(a.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
        if (!next[key]) next[key] = [];
        const exists = next[key].findIndex(x => x.id === a.id);
        if (exists === -1) {
          next[key] = [...next[key], a];
        } else {
          next[key] = next[key].map(x => x.id === a.id ? a : x);
        }
      });
      return next;
    });
  }, []);

  const schedule = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      const d = a.date instanceof Date ? a.date : new Date(a.date);
      map[d.getDate()] = a;
    });
    return map;
  }, [activities]);

  const addTemplate = useCallback((t) => {
    setTemplates(prev => [...prev, { ...t, id: crypto.randomUUID(), createdAt: new Date() }]);
  }, []);

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
