import React, { useState } from 'react';
import { Undo2, Redo2, LogOut, Cloud, CloudOff, Loader2, Menu, X, User } from 'lucide-react';

const TABS = ['Schema', 'Studio', 'Inställningar'];

function SyncBadge({ status }) {
  if (status === 'local') return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <CloudOff size={11} /> Lokalt
    </span>
  );
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
      <Loader2 size={11} className="animate-spin" /> Sparar…
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <Cloud size={11} /> Sparat
    </span>
  );
}

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo, onLogout, syncStatus, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAnon = user?.isAnonymous;

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/60 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">

          {/* Logotyp */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm leading-none">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 text-sm tracking-tight">Månadsblad</span>
              <span className="ml-1.5 text-[9px] font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 rounded-full uppercase tracking-widest">PRO</span>
            </div>
          </div>

          {/* Tabs desktop */}
          <nav className="hidden sm:flex items-center gap-1 mx-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'btn-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}>
                {tab}
              </button>
            ))}
          </nav>

          {/* Höger actions */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:block">
              <SyncBadge status={syncStatus} />
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
              <button onClick={onUndo} disabled={!canUndo} title="Ångra (Ctrl+Z)"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-30 disabled:pointer-events-none">
                <Undo2 size={14} />
              </button>
              <button onClick={onRedo} disabled={!canRedo} title="Gör om (Ctrl+Y)"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-30 disabled:pointer-events-none">
                <Redo2 size={14} />
              </button>
            </div>

            {isAnon && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                <User size={10} /> Anonymt
              </span>
            )}

            <button onClick={onLogout} title="Logga ut"
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
              <LogOut size={15} />
            </button>

            <button onClick={() => setMobileOpen(o => !o)}
              className="sm:hidden h-8 w-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobilmeny */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-100 py-3 space-y-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {tab}
              </button>
            ))}
            <div className="pt-2 px-4 flex items-center justify-between">
              <SyncBadge status={syncStatus} />
              {isAnon && <span className="text-[11px] text-slate-400 font-medium">Anonymt konto</span>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
