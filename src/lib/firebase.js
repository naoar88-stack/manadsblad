import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

let app;
let auth;
let db;
const appId = 'manadsblad';

try {
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (firebaseConfig.projectId) {
    app  = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db   = getFirestore(app);
  } else {
    throw new Error('Firebase-konfigurationsfel: projectId saknas.');
  }
} catch (error) {
  console.error('Fel vid Firebase-initialisering! Kontrollera miljövariabler.', error);
  console.warn('Kör nu i lokalt läge utan Firebase.');
}

export { auth, db, appId, signInAnonymously, onAuthStateChanged, doc, setDoc, onSnapshot };