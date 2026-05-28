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
      style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #f8f9fc 50%, #f0f4ff 100%)' }}
    >
      {/* Subtle bg orbs */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,120,246,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        }} />
      </div>

      <div className="w-full max-w-[420px] relative">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4560eb 0%, #7c3aed 100%)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Månadsblad
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Verktyget för svenska fritidsgårdar</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06)',
          }}
        >
          {/* Tab switcher */}
          <div className="flex gap-1 p-2 bg-black/[0.03] border-b border-black/[0.06]">
            {[['login','Logga in'],['register','Skapa konto']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-700 text-slate-600 mb-1.5" style={{ fontWeight: 700 }}>E-postadress</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="namn@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-black/[0.1] bg-black/[0.02] pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,120,246,0.15)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-700 text-slate-600 mb-1.5" style={{ fontWeight: 700 }}>Lösenord</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minst 6 tecken' : '••••••••'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-black/[0.1] bg-black/[0.02] pl-10 pr-11 py-3 text-sm font-medium outline-none focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,120,246,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Dölj lösenord' : 'Visa lösenord'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-xl animate-in">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 mt-1"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Laddar…</>
                : mode === 'login' ? 'Logga in' : 'Skapa konto'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="px-6 pb-1 flex items-center gap-3">
            <div className="flex-1 h-px bg-black/[0.07]" />
            <span className="text-xs text-slate-400 font-medium">eller</span>
            <div className="flex-1 h-px bg-black/[0.07]" />
          </div>

          {/* Anon */}
          <div className="px-6 pb-6 pt-3">
            <button
              onClick={handleAnon}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-black/[0.08] bg-black/[0.02] hover:bg-brand-50 hover:border-brand-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <UserCheck size={15} className="text-brand-500" />
              Fortsätt utan konto
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
