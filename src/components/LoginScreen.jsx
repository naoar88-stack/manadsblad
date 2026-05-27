import React, { useState } from 'react';
import { CalendarRange, Mail, Lock, Loader2, UserCheck, AlertCircle } from 'lucide-react';

export function LoginScreen({ onLoginEmail, onAnon, onRegister }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await onLoginEmail(email, password);
      else await onRegister(email, password);
    } catch (err) {
      setError(err?.message ?? 'Något gick fel. Försök igen.');
    }
    setLoading(false);
  };

  const handleAnon = async () => {
    setError('');
    setLoading(true);
    try { await onAnon(); }
    catch (err) { setError(err?.message ?? 'Kunde inte logga in anonymt.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Logotyp */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200/50">
            <CalendarRange size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Månadsblad
              <span className="ml-2 text-xs font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 rounded-full align-middle">PRO</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Verktyget för svenska fritidsgårdar</p>
          </div>
        </div>

        {/* Kort */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Flikar */}
          <div className="flex gap-1 p-1.5 bg-slate-50 border-b border-slate-100">
            {[['login','Logga in'],['register','Skapa konto']].map(([id, label]) => (
              <button key={id} onClick={() => { setMode(id); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                  mode === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* E-post */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-postadress" required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white transition" />
            </div>

            {/* Lösenord */}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Lösenord" required minLength={6}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white transition" />
            </div>

            {/* Felmeddelande */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Laddar…</>
                : mode === 'login' ? 'Logga in' : 'Skapa konto'
              }
            </button>
          </form>

          {/* Separator */}
          <div className="px-6 pb-2 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">eller</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Anonym */}
          <div className="px-6 pb-6 pt-2">
            <button onClick={handleAnon} disabled={loading}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
              <UserCheck size={15} className="text-indigo-500" />
              Fortsätt utan konto (anonymt)
            </button>
            <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
              Ditt schema sparas säkert i Firebase och synkas i realtid.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
