import { useEffect, useRef, useCallback } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from '../lib/firebase';

const DEBOUNCE_MS  = 1500;
const MAX_RETRIES  = 3;

export function useFirebaseSync({ uid, monthKey, activities, settings, setActivities, setSettings, localMode }) {
  const debounceActs     = useRef(null);
  const debounceSettings = useRef(null);
  const isRemoteUpdate   = useRef(false);
  const pendingDeletes   = useRef(new Set());
  const latestActivities = useRef(activities);
  const latestSettings   = useRef(settings);
  const retryCount       = useRef(0);

  useEffect(() => { latestActivities.current = activities; }, [activities]);
  useEffect(() => { latestSettings.current   = settings;   }, [settings]);

  // ── Prenumerera på Firestore och ladda inställningar ──
  useEffect(() => {
    if (!db || !uid || localMode) return;

    // Capture monthKey i closuren.
    // stale = true när cleanup körs (dvs. månaden har bytt).
    // onSnapshot-callbacks kollar denna flagga före alla state-uppdateringar
    // så ett svar från en gammal subscription aldrig kan skriva över
    // data för den nya månaden.
    let stale = false;

    const planRef     = doc(db, 'users', uid, 'plans', monthKey);
    const settingsRef = doc(db, 'users', uid, 'meta', 'settings');

    // Hämta inställningar en gång vid mount
    getDoc(settingsRef).then(snap => {
      if (stale) return; // Månaden har bytts sedan anropet startades
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setSettings(prev => ({ ...prev, ...snap.data() }));
        isRemoteUpdate.current = false;
      }
    }).catch(e => console.warn('[Firestore] Kunde inte hämta inställningar:', e));

    // Lyssna på aktiviteter i realtid
    const unsub = onSnapshot(planRef, snap => {
      if (stale) return; // Gamla subscription svarar efter månadsbyte → ignorera
      if (!snap.exists()) return;
      const data = snap.data();
      if (!data?.activities) return;

      // Filtrera bort lokalt raderade aktiviteter
      const filtered = data.activities.filter(a => !pendingDeletes.current.has(a.id));
      isRemoteUpdate.current = true;
      setActivities(filtered.map(a => ({
        ...a,
        date: a.date ? new Date(a.date) : new Date(),
      })));
      isRemoteUpdate.current = false;
    }, err => {
      if (stale) return;
      console.error('[Firestore] Snapshot-fel:', err);
    });

    return () => {
      stale = true;  // Markera alla pendända callbacks som föråldrade
      unsub();       // Avsluta Firestore-subscription
      // Avbryt eventuellt pendände debounce-skrivningar för gamla månaden
      // så vi inte råkar spara fel månads data
      clearTimeout(debounceActs.current);
    };
  }, [uid, monthKey, localMode]); // eslint-disable-line

  // Sparfunktion med retry-logik
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
    } catch (e) {
      console.error('[Firestore] Sparfel aktiviteter:', e);
      // Exponentiell backoff vid fel
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
    } catch (e) {
      console.error('[Firestore] Sparfel inställningar:', e);
    }
  }, [uid, localMode]);

  // Debounced writes – triggas av state-ändringar
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
    registerDelete: useCallback((id) => { pendingDeletes.current.add(id); }, []),
  };
}
