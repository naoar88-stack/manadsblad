import { useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '../lib/firebase';

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginAnon = async () => {
    if (!auth) return;
    setError('');
    try { await signInAnonymously(auth); }
    catch (e) { setError(e.message); }
  };

  const loginEmail = async (email, password) => {
    setError('');
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { setError(friendlyError(e.code)); }
  };

  const registerEmail = async (email, password) => {
    setError('');
    try { await createUserWithEmailAndPassword(auth, email, password); }
    catch (e) { setError(friendlyError(e.code)); }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return { user, loading, error, loginAnon, loginEmail, registerEmail, logout };
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':   'Inget konto med den e-postadressen.',
    'auth/wrong-password':   'Fel lösenord.',
    'auth/email-already-in-use': 'E-postadressen används redan.',
    'auth/invalid-email':    'Ogiltig e-postadress.',
    'auth/weak-password':    'Lösenordet måste vara minst 6 tecken.',
    'auth/too-many-requests':'För många försök. Vänta en stund.',
  };
  return map[code] || 'Något gick fel. Försök igen.';
}
