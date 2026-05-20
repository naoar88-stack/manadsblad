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
  }
} catch (error) {
  console.warn('Firebase kunde inte initieras, kör lokalt läge.', error);
}

export { auth, db, appId, signInAnonymously, onAuthStateChanged, doc, setDoc, onSnapshot };
