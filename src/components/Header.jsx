import React from 'react';
import { Undo2, Redo2, LogOut, CalendarRange } from 'lucide-react';

const TABS = ['Schema', 'Studio', 'Inställningar'];

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 lg:px-6 pt-3 pb-3">
      <div className="max-w-screen-2xl mx-auto bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.08)] rounded-[28px] px-5 py-3 flex flex-col sm:flex-row items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <CalendarRange className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">SaaS för fritidsgårdar</div>
            <div className="text-lg font-extrabold text-slate-900 leading-tight">
              Månadsblad <span className="text-indigo-600">Pro</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 flex justify-center">
          <div className="inline-flex gap-1.5 rounded-2xl bg-slate-100 border border-slate-200 p-1.5">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.22)]'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >{tab}</button>
            ))}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo} disabled={!canUndo}
            className={`h-10 px-4 rounded-2xl border text-sm font-medium flex items-center gap-1.5 ${
              canUndo ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          ><Undo2 className="w-4 h-4" />Undo</button>
          <button
            onClick={onRedo} disabled={!canRedo}
            className={`h-10 px-4 rounded-2xl border text-sm font-medium flex items-center gap-1.5 ${
              canRedo ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          ><Redo2 className="w-4 h-4" />Redo</button>
          <button className="h-10 px-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />Logga ut
          </button>
        </div>
      </div>
    </header>
  );
}
