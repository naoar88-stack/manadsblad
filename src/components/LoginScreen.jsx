import React, { useState } from 'react';
import { CalendarRange, Mail, Lock, Loader2, UserCheck } from 'lucide-react';

export function LoginScreen({ onLoginEmail, onLoginAnon, onRegister, error, loading }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'register'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') onLoginEmail(email, password);
    else onRegister(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logotyp */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-[22px] bg-slate-900 items-center justify-center shadow-[0_12px_32px_rgba(15,23,42,0.22)] mb-4">
            <CalendarRange className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Månadsblad <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">SaaS för svenska fritidsgårdar</p>
        </div>

        {/* Kort */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_24px_60px_rgba(15,23,42,0.1)] p-8">
          {/* Flik-växling */}
          <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 mb-6">
            {[['login','Logga in'],['register','Skapa konto']].map(([id, label]) => (
              <button
                key={id} type="button"
                onClick={() => setMode(id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                  mode === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >{label}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-postadress"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Lösenord"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Laddar...</>
                : mode === 'login' ? 'Logga in' : 'Skapa konto'
              }
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">eller</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Anonym inloggning */}
          <button
            type="button" onClick={onLoginAnon} disabled={loading}
            className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            Fortsätt utan konto (anonymt)
          </button>

          <p className="text-center text-xs text-slate-400 mt-5">
            Ditt schema sparas säkert i Firebase och synkas i realtid på alla dina enheter.
          </p>
        </div>
      </div>
    </div>
  );
}
