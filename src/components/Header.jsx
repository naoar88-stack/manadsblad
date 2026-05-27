import React from 'react';
import { Undo2, Redo2, LogOut, Sparkles } from 'lucide-react';
import { SyncStatus } from './SyncStatus';

const TABS = ['Schema', 'Studio', 'Inställningar'];

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo, onLogout, syncStatus, user }) {
  const isAnon = user?.isAnonymous;

  return (
    <header
      className="glass fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl shadow-xl"
      style={{
        width: 'min(960px, calc(100vw - 2rem))',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* ── Logotyp ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
        }}>
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="leading-none">
          <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Fritidsgård</div>
          <div className="text-sm font-extrabold text-slate-900 leading-tight">
            Månadsblad
            <span style={{
              marginLeft: 5,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              background: 'linear-gradient(90deg,#7c3aed,#ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              verticalAlign: 'middle',
            }}>PRO</span>
          </div>
        </div>
      </div>

      {/* ── Tabs — centrerade ── */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={activeTab === tab ? {
                background: 'linear-gradient(135deg,#1e293b,#334155)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(15,23,42,0.25)',
              } : {
                color: '#64748b',
                background: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Höger: actions ── */}
      <div className="flex items-center gap-2 shrink-0">
        {isAnon && (
          <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-600 font-semibold border border-amber-200">
            Anonymt
          </span>
        )}

        <SyncStatus status={syncStatus} />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition"
        >
          <Redo2 size={15} />
        </button>
        <button
          onClick={onLogout}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
