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

let app, auth, db, storage;

try {
  const cfg = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (!cfg.projectId) throw new Error('VITE_FIREBASE_PROJECT_ID saknas i .env');
  app     = initializeApp(cfg);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.warn('[Firebase] Kör utan Firebase — lokalt läge aktiverat.', e.message);
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
