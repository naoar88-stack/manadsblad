import { useEffect, useRef, useCallback } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from '../lib/firebase';

const DEBOUNCE_MS = 1200;

/**
 * Synkar aktiviteter och inställningar mot Firestore.
 * BUGGFIX: pendingDeletes-set håller koll på IDs som nyss raderats lokalt,
 * så att Firestore-synken INTE skriver tillbaka dem.
 */
export function useFirebaseSync({ uid, monthKey, activities, settings, setActivities, setSettings, localMode }) {
  const debounceTimer    = useRef(null);
  const isRemoteUpdate   = useRef(false);
  const pendingDeletes   = useRef(new Set());
  const latestActivities = useRef(activities);

  useEffect(() => { latestActivities.current = activities; }, [activities]);

  useEffect(() => {
    if (!db || !uid || localMode) return;

    const planRef     = doc(db, 'users', uid, 'plans', monthKey);
    const settingsRef = doc(db, 'users', uid, 'meta', 'settings');

    getDoc(settingsRef).then(snap => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setSettings(prev => ({ ...prev, ...snap.data() }));
        isRemoteUpdate.current = false;
      }
    });

    const unsub = onSnapshot(planRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.activities) {
          // Filtrera bort IDs som användaren nyss raderat lokalt
          const filtered = data.activities.filter(a => !pendingDeletes.current.has(a.id));
          isRemoteUpdate.current = true;
          setActivities(filtered.map(a => ({ ...a, date: new Date(a.date) })));
          isRemoteUpdate.current = false;
        }
      }
    });

    return () => unsub();
  }, [uid, monthKey, localMode]);

  const saveActivities = useCallback(() => {
    if (!db || !uid || localMode || isRemoteUpdate.current) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const planRef = doc(db, 'users', uid, 'plans', monthKey);
        await setDoc(planRef, {
          activities: latestActivities.current.map(a => ({
            ...a,
            date: a.date instanceof Date ? a.date.toISOString() : a.date
          })),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        pendingDeletes.current.clear();
      } catch (e) {
        console.error('[Firestore] Sparfel aktiviteter:', e);
      }
    }, DEBOUNCE_MS);
  }, [uid, monthKey, localMode]);

  const saveSettings = useCallback(() => {
    if (!db || !uid || localMode || isRemoteUpdate.current) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const settingsRef = doc(db, 'users', uid, 'meta', 'settings');
        await setDoc(settingsRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error('[Firestore] Sparfel inställningar:', e);
      }
    }, DEBOUNCE_MS);
  }, [uid, settings, localMode]);

  useEffect(() => { saveActivities(); }, [activities]);
  useEffect(() => { saveSettings(); },  [settings]);

  return {
    registerDelete: (id) => { pendingDeletes.current.add(id); }
  };
}
