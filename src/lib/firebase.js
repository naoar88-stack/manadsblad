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

// Fallback-config om VITE_-miljövariabler saknas
const FALLBACK_CONFIG = {
  apiKey:            'AIzaSyAoxcHZZHnLFnl5i9ngF9LvYekjVef3AD0',
  authDomain:        'manadsblad-2aafd.firebaseapp.com',
  projectId:         'manadsblad-2aafd',
  storageBucket:     'manadsblad-2aafd.firebasestorage.app',
  messagingSenderId: '942783898702',
  appId:             '1:942783898702:web:412d9bab6eb1fa68ef8f1f',
};

let app, auth, db, storage;

try {
  const cfg = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             || FALLBACK_CONFIG.apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         || FALLBACK_CONFIG.authDomain,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          || FALLBACK_CONFIG.projectId,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      || FALLBACK_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID              || FALLBACK_CONFIG.appId,
  };
  app     = initializeApp(cfg);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
  console.log('[Firebase] Ansluten till:', cfg.projectId);
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
