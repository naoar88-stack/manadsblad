import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Undo2, Redo2, LogOut, Cloud, CloudOff, Loader2, Menu, X, User } from 'lucide-react';

const TABS = ['Schema', 'Studio', 'Inställningar'];

function SyncBadge({ status }) {
  if (status === 'local') return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <CloudOff size={11} aria-hidden="true" /> Lokalt
    </span>
  );
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full" role="status" aria-live="polite">
      <Loader2 size={11} className="animate-spin" aria-hidden="true" /> Sparar…
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full" role="status">
      <Cloud size={11} aria-hidden="true" /> Sparat
    </span>
  );
}

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo, onLogout, syncStatus, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible,    setVisible]    = useState(false); // styr CSS-transition
  const menuRef      = useRef(null);
  const toggleBtnRef = useRef(null);
  const isAnon = user?.isAnonymous;

  // Öppna/stäng med animation
  const openMenu  = useCallback(() => { setMobileOpen(true);  requestAnimationFrame(() => setVisible(true));  }, []);
  const closeMenu = useCallback(() => {
    setVisible(false);
    // Vänta på transition (200ms) innan vi plockar bort ur DOM
    setTimeout(() => setMobileOpen(false), 200);
  }, []);
  const toggleMenu = useCallback(() => (mobileOpen ? closeMenu() : openMenu()), [mobileOpen, openMenu, closeMenu]);

  // Stäng vid klick utanför
  useEffect(() => {
    if (!mobileOpen) return;
    function handlePointer(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          toggleBtnRef.current && !toggleBtnRef.current.contains(e.target)) {
        closeMenu();
      }
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [mobileOpen, closeMenu]);

  // Stäng vid Escape
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') {
        closeMenu();
        toggleBtnRef.current?.focus();
      }
      // Focus trap: Tab / Shift+Tab stannar inuti menyn
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = [...menuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )].filter(el => !el.disabled);
        if (!focusable.length) { e.preventDefault(); return; }
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen, closeMenu]);

  // Flytta fokus till första menyknappen när menyn öppnas
  useEffect(() => {
    if (mobileOpen && visible && menuRef.current) {
      const first = menuRef.current.querySelector('button, [href]');
      first?.focus();
    }
  }, [mobileOpen, visible]);

  // Lås scroll på body när menyn är öppen (mobil)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
    closeMenu();
  }, [setActiveTab, closeMenu]);

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/60 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">

          {/* Logotyp */}
          <div className="flex items-center gap-2.5 shrink-0" aria-label="Månadsblad Pro">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md" aria-hidden="true">
              <span className="text-white font-black text-sm leading-none">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 text-sm tracking-tight">Månadsblad</span>
              <span className="ml-1.5 text-[9px] font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 rounded-full uppercase tracking-widest" aria-label="Pro">PRO</span>
            </div>
          </div>

          {/* Tabs desktop */}
          <nav className="hidden sm:flex items-center gap-1 mx-auto" aria-label="Huvudnavigering">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
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

            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1" role="group" aria-label="Ångra/Gör om">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Ångra (Ctrl+Z)"
                title="Ångra (Ctrl+Z)"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-30 disabled:pointer-events-none">
                <Undo2 size={14} aria-hidden="true" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Gör om (Ctrl+Y)"
                title="Gör om (Ctrl+Y)"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-30 disabled:pointer-events-none">
                <Redo2 size={14} aria-hidden="true" />
              </button>
            </div>

            {isAnon && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                <User size={10} aria-hidden="true" /> Anonymt
              </span>
            )}

            <button
              onClick={onLogout}
              aria-label="Logga ut"
              title="Logga ut"
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
              <LogOut size={15} aria-hidden="true" />
            </button>

            {/* Hamburger-knapp — bara synlig på mobil */}
            <button
              ref={toggleBtnRef}
              onClick={toggleMenu}
              aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="sm:hidden h-8 w-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobilmeny — animerad */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            ref={menuRef}
            aria-label="Mobilnavigering"
            style={{
              overflow: 'hidden',
              maxHeight: visible ? '320px' : '0',
              opacity:   visible ? 1 : 0,
              transition: 'max-height 200ms ease, opacity 200ms ease',
            }}
          >
            <div className="border-t border-slate-100 py-3 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  aria-current={activeTab === tab ? 'page' : undefined}
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
          </nav>
        )}
      </div>
    </header>
  );
}
