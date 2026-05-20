import { useState, useEffect } from 'react';
import {
  auth,
  db,
  appId,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  setDoc,
  onSnapshot,
} from '../lib/firebase';

const DEFAULT_TEMPLATES = [
  { id: 't1', title: 'Pysselkväll', color: 'bg-pink-100 text-pink-700', icon: '🎨' },
  { id: 't2', title: 'Spelturnering', color: 'bg-blue-100 text-blue-700', icon: '🎮' },
  { id: 't3', title: 'Tjejkväll', color: 'bg-purple-100 text-purple-700', icon: '✨' },
  { id: 't4', title: 'Öppen Musikstudio', color: 'bg-green-100 text-green-700', icon: '🎧' },
  { id: 't5', title: 'Filmvisning', color: 'bg-yellow-100 text-yellow-700', icon: '🍿' },
];

// month = 'YYYY-MM', t.ex. '2026-02'
export function useSchedule(month) {
  const [userId, setUserId] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Anonym inloggning
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Anonym inloggning misslyckades:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Lyssna på Firestore när userId och month är kända
  useEffect(() => {
    if (!userId || !db || !month) return;

    // Nollställ state vid månadsbyte
    setSchedule({});
    setIsLoading(true);

    const docRef = doc(
      db,
      `artifacts/${appId}/public/data/manadsblad/${userId}/months`,
      month
    );

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSchedule(data.schedule || {});
        setTemplates(data.templates?.length ? data.templates : DEFAULT_TEMPLATES);
      } else {
        setDoc(docRef, { schedule: {}, templates: DEFAULT_TEMPLATES });
        setSchedule({});
        setTemplates(DEFAULT_TEMPLATES);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, month]);

  // 3. Skriv till Firestore
  const persist = (newSchedule, newTemplates) => {
    if (!userId || !db || !month) return;
    const docRef = doc(
      db,
      `artifacts/${appId}/public/data/manadsblad/${userId}/months`,
      month
    );
    setDoc(docRef, { schedule: newSchedule, templates: newTemplates });
  };

  const addActivityToDay = (day, activity) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        [day]: [...(prev[day] || []), { ...activity, uniqueId: crypto.randomUUID() }],
      };
      persist(updated, templates);
      return updated;
    });
  };

  const removeActivityFromDay = (day, uniqueId) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        [day]: prev[day].filter((a) => a.uniqueId !== uniqueId),
      };
      persist(updated, templates);
      return updated;
    });
  };

  const addTemplate = (template) => {
    const newTemplate = { ...template, id: crypto.randomUUID() };
    setTemplates((prev) => {
      const updated = [...prev, newTemplate];
      persist(schedule, updated);
      return updated;
    });
  };

  return {
    schedule,
    templates,
    addActivityToDay,
    removeActivityFromDay,
    addTemplate,
    isLoading,
    userId,
  };
}
