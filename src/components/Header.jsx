import React from 'react';
import { Undo2, Redo2, LogOut, CalendarRange } from 'lucide-react';
import { SyncStatus } from './SyncStatus';

const TABS = ['Schema', 'Studio', 'Inställningar'];

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo, onLogout, syncStatus, user }) {
  const isAnon = user?.isAnonymous;
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 lg:px-6 pt-3 pb-3">
      <div className="max-w-screen-2xl mx-auto bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.08)] rounded-[28px] px-5 py-3 flex flex-row flex-wrap items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <CalendarRange className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Fritidsgård</div>
            <div className="text-base font-extrabold text-slate-900 leading-tight">
              Månadsblad <span className="text-indigo-600">Pro</span>
            </div>
          </div>
        </div>

        {/* Tabs — centrerade */}
        <nav className="flex-1 flex justify-center">
          <div className="inline-flex gap-1 rounded-2xl bg-slate-100 border border-slate-200 p-1">
            {TABS.map(tab => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >{tab}</button>
            ))}
          </div>
        </nav>

        {/* Actions — höger */}
        <div className="flex items-center gap-1.5 shrink-0">
          <SyncStatus status={syncStatus} />
          <button onClick={onUndo} disabled={!canUndo}
            title="Ångra"
            className={`h-9 w-9 rounded-xl border flex items-center justify-center transition ${
              canUndo ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}><Undo2 className="w-4 h-4" /></button>
          <button onClick={onRedo} disabled={!canRedo}
            title="Gör om"
            className={`h-9 w-9 rounded-xl border flex items-center justify-center transition ${
              canRedo ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}><Redo2 className="w-4 h-4" /></button>
          {isAnon && <span className="text-[10px] text-amber-500 font-medium hidden sm:block">Anonymt</span>}
          <button onClick={onLogout} title="Logga ut"
            className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
