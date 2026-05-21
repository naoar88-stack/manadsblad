import { useEffect, useRef, useCallback } from 'react';
import {
  db,
  doc, getDoc, setDoc, onSnapshot,
  serverTimestamp,
} from '../lib/firebase';

const DEBOUNCE_MS = 1200;

/**
 * Synkar aktiviteter och inställningar mot Firestore (per användare + månadsnyckel).
 * Fallback: gör ingenting om db är undefined (lokalt läge).
 */
export function useFirebaseSync({ uid, monthKey, activities, settings, setActivities, setSettings, localMode }) {
  const debounceTimer  = useRef(null);
  const isRemoteUpdate = useRef(false);

  // --- Läs in från Firestore när uid eller månadsnyckel ändras ---
  useEffect(() => {
    if (!db || !uid || localMode) return;

    const planRef     = doc(db, 'users', uid, 'plans', monthKey);
    const settingsRef = doc(db, 'users', uid, 'meta', 'settings');

    // Hämta sparade inställningar en gång
    getDoc(settingsRef).then(snap => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setSettings(prev => ({ ...prev, ...snap.data() }));
        isRemoteUpdate.current = false;
      }
    });

    // Realtidslyssning på aktiv månadsplan
    const unsub = onSnapshot(planRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.activities) {
          isRemoteUpdate.current = true;
          setActivities(
            data.activities.map(a => ({ ...a, date: new Date(a.date) }))
          );
          isRemoteUpdate.current = false;
        }
      }
    });

    return () => unsub();
  }, [uid, monthKey, localMode]);

  // --- Debounced sparning när aktiviteter ändras ---
  const saveActivities = useCallback(() => {
    if (!db || !uid || localMode || isRemoteUpdate.current) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const planRef = doc(db, 'users', uid, 'plans', monthKey);
        await setDoc(planRef, {
          activities: activities.map(a => ({ ...a, date: a.date.toISOString() })),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error('[Firestore] Sparfel aktiviteter:', e);
      }
    }, DEBOUNCE_MS);
  }, [uid, monthKey, activities, localMode]);

  // --- Debounced sparning när inställningar ändras ---
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
  useEffect(() => { saveSettings();   }, [settings]);
}
