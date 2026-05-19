import { useEffect, useState } from 'react';
import { auth, db, appId, signInAnonymously, onAuthStateChanged, doc, setDoc, onSnapshot } from '../lib/firebase';

export function useFirebaseSync(state) {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setIsReady(true);
      return;
    }

    signInAnonymously(auth).catch((error) => {
      console.warn('Kunde inte logga in anonymt.', error);
      setIsReady(true);
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser || null);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) return undefined;

    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'default');
    const activitiesRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'plans',
      `${state.selectedYear}-${state.selectedMonth}`
    );

    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (typeof data.headerTitle === 'string') state.setHeaderTitle(data.headerTitle);
      if (typeof data.footerText === 'string') state.setFooterText(data.footerText);
      if (Array.isArray(data.activeWeekdays)) state.setActiveWeekdays(data.activeWeekdays);
      if (typeof data.selectedTemplate === 'string') state.setSelectedTemplate(data.selectedTemplate);
      if (typeof data.selectedFormat === 'string') state.setSelectedFormat(data.selectedFormat);
      if (typeof data.geminiApiKey === 'string') state.setGeminiApiKey(data.geminiApiKey);
    });

    const unsubActivities = onSnapshot(activitiesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (data.activities) state.setActivities(data.activities);
    });

    return () => {
      unsubSettings();
      unsubActivities();
    };
  }, [user, state.selectedYear, state.selectedMonth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__GEMINI_API_KEY = state.geminiApiKey || '';
    }
  }, [state.geminiApiKey]);

  useEffect(() => {
    if (!db || !user || !isReady) return;

    const timeout = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'default');
        await setDoc(settingsRef, {
          headerTitle: state.headerTitle,
          footerText: state.footerText,
          activeWeekdays: state.activeWeekdays,
          selectedTemplate: state.selectedTemplate,
          selectedFormat: state.selectedFormat,
          geminiApiKey: state.geminiApiKey,
        }, { merge: true });

        const activitiesRef = doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'plans',
          `${state.selectedYear}-${state.selectedMonth}`
        );
        await setDoc(activitiesRef, { activities: state.activities }, { merge: true });
        setSyncStatus('saved');
      } catch (error) {
        console.error('Kunde inte spara till Firestore.', error);
        setSyncStatus('error');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    user,
    isReady,
    state.headerTitle,
    state.footerText,
    state.activeWeekdays,
    state.selectedTemplate,
    state.selectedFormat,
    state.geminiApiKey,
    state.activities,
    state.selectedYear,
    state.selectedMonth,
  ]);

  return { user, syncStatus, isReady, hasCloud: Boolean(db && auth) };
}
