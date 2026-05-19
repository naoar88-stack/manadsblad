import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

let app;
let auth;
let db;
let storage;
let appId = 'manadsblad';

try {
  const firebaseConfig = JSON.parse(
    typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
  );
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  appId = typeof __app_id !== 'undefined' ? __app_id : 'manadsblad';
} catch (error) {
  console.warn('Firebase kunde inte initieras, kör lokalt läge.', error);
}

export {
  auth,
  db,
  storage,
  appId,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  setDoc,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
};
