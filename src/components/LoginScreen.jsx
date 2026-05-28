import React, { useState } from 'react';
import { Mail, Lock, Loader2, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function LoginScreen({ onLoginEmail, onAnon, onRegister }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#f8fafc' }}
    >
      <div className="w-full max-w-[400px]">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: '#4f46e5',
              boxShadow: '0 2px 8px rgba(79,70,229,0.28), 0 8px 24px rgba(79,70,229,0.16)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Månadsblad</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Fritidsgård — schemaverktyget</p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-3xl p-7"
          style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.05), 0 0 0 1px rgba(15,23,42,0.06)' }}
        >
          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 gap-1">
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 active:scale-95'
                }`}
              >
                {m === 'login' ? 'Logga in' : 'Registrera'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="E-postadress"
                  required
                  autoComplete="email"
                  className="input pl-10"
                  aria-label="E-postadress"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Lösenord"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="input pl-10 pr-11"
                  aria-label="Lösenord"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 active:scale-90 transition-all p-1 rounded-lg"
                  aria-label={showPass ? 'Dölj lösenord' : 'Visa lösenord'}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200"
                role="alert"
              >
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs font-semibold text-red-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-5"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Laddar…</>
                : mode === 'login' ? 'Logga in' : 'Skapa konto'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">eller</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Anon login */}
          <button
            type="button"
            onClick={handleAnon}
            disabled={loading}
            className="btn-secondary w-full gap-2"
          >
            <UserCheck size={15} aria-hidden="true" />
            Fortsätt utan konto
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          Dina data lagras säkert i Firebase och tillhör bara dig.
        </p>
      </div>
    </div>
  );
}
