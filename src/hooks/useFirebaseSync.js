import { useEffect, useRef, useCallback, useState } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from '../lib/firebase';

const DEBOUNCE_MS  = 1500;
const MAX_RETRIES  = 3;

/**
 * useFirebaseSync
 * Synkroniserar activities + settings mot Firestore.
 *
 * Returnerar:
 *   dataLoading    — true tills första snapshot är klar
 *   registerDelete — registrera id som ska filtreras bort vid nästa snapshot
 *   onWriteResult  — callback(ok: boolean) anropas efter varje Firestore-skrivning
 *                    Sätt via ref i App.jsx för att styra syncStatus.
 */
export function useFirebaseSync({ uid, monthKey, activities, settings, setActivities, setSettings, localMode, onWriteResult }) {
  const debounceActs     = useRef(null);
  const debounceSettings = useRef(null);
  const isRemoteUpdate   = useRef(false);
  const pendingDeletes   = useRef(new Set());
  const latestActivities = useRef(activities);
  const latestSettings   = useRef(settings);
  const retryCount       = useRef(0);
  const onWriteResultRef = useRef(onWriteResult);

  // Håll ref uppdaterad utan att orsaka re-renders
  useEffect(() => { onWriteResultRef.current = onWriteResult; }, [onWriteResult]);

  // dataLoading = true tills första snapshot kommit (per månad)
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => { latestActivities.current = activities; }, [activities]);
  useEffect(() => { latestSettings.current   = settings;   }, [settings]);

  useEffect(() => {
    if (!db || !uid || localMode) {
      setDataLoading(false);
      return;
    }

    // Återställ laddningsstatus vid månadsbyte
    setDataLoading(true);

    let stale = false;

    const planRef     = doc(db, 'users', uid, 'plans', monthKey);
    const settingsRef = doc(db, 'users', uid, 'meta', 'settings');

    getDoc(settingsRef).then(snap => {
      if (stale) return;
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setSettings(prev => ({ ...prev, ...snap.data() }));
        isRemoteUpdate.current = false;
      }
    }).catch(e => console.warn('[Firestore] Kunde inte hämta inställningar:', e));

    const unsub = onSnapshot(planRef, snap => {
      if (stale) return;

      if (snap.exists()) {
        const data = snap.data();
        if (data?.activities) {
          const filtered = data.activities.filter(a => !pendingDeletes.current.has(a.id));
          isRemoteUpdate.current = true;
          setActivities(filtered.map(a => ({
            ...a,
            date: a.date ? new Date(a.date) : new Date(),
          })));
          isRemoteUpdate.current = false;
        }
      }

      // Första snapshot klar — oavsett om det fanns data
      setDataLoading(false);
    }, err => {
      if (stale) return;
      console.error('[Firestore] Snapshot-fel:', err);
      setDataLoading(false); // Visa UI ändå vid fel
    });

    return () => {
      stale = true;
      unsub();
      clearTimeout(debounceActs.current);
    };
  }, [uid, monthKey, localMode]); // eslint-disable-line

  const persistActivities = useCallback(async () => {
    if (!db || !uid || localMode || isRemoteUpdate.current) return;
    try {
      const planRef = doc(db, 'users', uid, 'plans', monthKey);
      await setDoc(planRef, {
        activities: latestActivities.current.map(a => ({
          ...a,
          date: a.date instanceof Date ? a.date.toISOString() : a.date,
        })),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      pendingDeletes.current.clear();
      retryCount.current = 0;
      onWriteResultRef.current?.(true);
    } catch (e) {
      console.error('[Firestore] Sparfel aktiviteter:', e);
      onWriteResultRef.current?.(false);
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setTimeout(persistActivities, 1000 * retryCount.current);
      }
    }
  }, [uid, monthKey, localMode]);

  const persistSettings = useCallback(async () => {
    if (!db || !uid || localMode || isRemoteUpdate.current) return;
    try {
      const settingsRef = doc(db, 'users', uid, 'meta', 'settings');
      await setDoc(settingsRef, {
        ...latestSettings.current,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      onWriteResultRef.current?.(true);
    } catch (e) {
      console.error('[Firestore] Sparfel inställningar:', e);
      onWriteResultRef.current?.(false);
    }
  }, [uid, localMode]);

  useEffect(() => {
    if (isRemoteUpdate.current) return;
    clearTimeout(debounceActs.current);
    debounceActs.current = setTimeout(persistActivities, DEBOUNCE_MS);
    return () => clearTimeout(debounceActs.current);
  }, [activities, persistActivities]);

  useEffect(() => {
    if (isRemoteUpdate.current) return;
    clearTimeout(debounceSettings.current);
    debounceSettings.current = setTimeout(persistSettings, DEBOUNCE_MS);
    return () => clearTimeout(debounceSettings.current);
  }, [settings, persistSettings]);

  return {
    dataLoading,
    registerDelete: useCallback((id) => { pendingDeletes.current.add(id); }, []),
  };
}
