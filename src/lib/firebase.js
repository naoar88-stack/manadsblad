import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc, getDoc, setDoc, onSnapshot,
  collection, getDocs, addDoc, deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Alla Firebase-värden måste sättas som VITE_-miljövariabler i Vercel.
// Lokalt: kopiera .env.example till .env.local och fyll i värdena.
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

let app, auth, db, storage;

try {
  const missing = REQUIRED_VARS.filter(k => !import.meta.env[k]);
  if (missing.length) {
    console.warn('[Firebase] Saknade env-variabler:', missing, '→ Lokalt läge aktiverat');
    throw new Error('Missing env vars: ' + missing.join(', '));
  }

  const cfg = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app     = initializeApp(cfg);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);

  // Logga bara i dev-läge — avslöja inte projectId i produktion
  if (import.meta.env.DEV) {
    console.log('[Firebase] Ansluten till:', cfg.projectId);
  }
} catch (e) {
  console.warn('[Firebase] Lokalt läge —', e.message);
}

export {
  auth, db, storage,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc, getDoc, setDoc, onSnapshot,
  collection, getDocs, addDoc, deleteDoc,
  serverTimestamp,
};
