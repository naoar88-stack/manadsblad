import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Undo2, Redo2, LogOut, Cloud, CloudOff, Loader2, Menu, X, User } from 'lucide-react';

const TABS = ['Schema', 'Studio', 'Inställningar'];

const TAB_ICONS = {
  Schema:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Studio:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  Inställningar:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

function SyncBadge({ status }) {
  if (status === 'local') return (
    <span className="badge badge-amber">
      <CloudOff size={10} aria-hidden="true" /> Lokalt
    </span>
  );
  if (status === 'saving') return (
    <span className="badge badge-brand" role="status" aria-live="polite">
      <Loader2 size={10} className="animate-spin" aria-hidden="true" /> Sparar…
    </span>
  );
  return (
    <span className="badge badge-green" role="status">
      <Cloud size={10} aria-hidden="true" /> Sparat
    </span>
  );
}

export function Header({ activeTab, setActiveTab, canUndo, canRedo, onUndo, onRedo, onLogout, syncStatus, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible,    setVisible]    = useState(false);
  const menuRef      = useRef(null);
  const toggleBtnRef = useRef(null);
  const isAnon = user?.isAnonymous;

  const openMenu  = useCallback(() => { setMobileOpen(true);  requestAnimationFrame(() => setVisible(true));  }, []);
  const closeMenu = useCallback(() => {
    setVisible(false);
    setTimeout(() => setMobileOpen(false), 220);
  }, []);
  const toggleMenu = useCallback(() => (mobileOpen ? closeMenu() : openMenu()), [mobileOpen, openMenu, closeMenu]);

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

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') { closeMenu(); toggleBtnRef.current?.focus(); }
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = [...menuRef.current.querySelectorAll(
          'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
        )].filter(el => !el.disabled);
        if (!focusable.length) { e.preventDefault(); return; }
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen, closeMenu]);

  useEffect(() => {
    if (mobileOpen && visible && menuRef.current) {
      menuRef.current.querySelector('button, [href]')?.focus();
    }
  }, [mobileOpen, visible]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleTabClick = useCallback((tab) => { setActiveTab(tab); closeMenu(); }, [setActiveTab, closeMenu]);

  return (
    <header className="sticky top-0 z-40 glass border-b border-black/[0.07] shadow-xs">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 select-none" aria-label="Månadsblad">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4560eb 0%, #7c3aed 100%)' }}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-800 text-slate-900 text-sm tracking-tight" style={{ fontWeight: 800 }}>Månadsblad</span>
              <span className="text-[10px] font-700 text-brand-600" style={{ fontWeight: 700, letterSpacing: '0.04em' }}>FRITIDSGÅRD</span>
            </div>
          </div>

          {/* Nav — desktop */}
          <nav className="hidden sm:flex items-center gap-0.5 mx-auto bg-black/[0.04] rounded-2xl p-1" aria-label="Huvudnavigering">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                {TAB_ICONS[tab]}
                {tab}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:block">
              <SyncBadge status={syncStatus} />
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 bg-black/[0.04] rounded-xl p-0.5" role="group" aria-label="Ångra/Gör om">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Ångra (Ctrl+Z)"
                title="Ångra (Ctrl+Z)"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <Undo2 size={13} aria-hidden="true" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Gör om (Ctrl+Y)"
                title="Gör om (Ctrl+Y)"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <Redo2 size={13} aria-hidden="true" />
              </button>
            </div>

            {isAnon && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-black/[0.04] px-2.5 py-1 rounded-full">
                <User size={10} aria-hidden="true" /> Anonymt
              </span>
            )}

            <button
              onClick={onLogout}
              aria-label="Logga ut"
              title="Logga ut"
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>

            <button
              ref={toggleBtnRef}
              onClick={toggleMenu}
              aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="sm:hidden h-9 w-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-black/[0.06] transition-all"
            >
              {mobileOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            ref={menuRef}
            aria-label="Mobilnavigering"
            style={{
              overflow: 'hidden',
              maxHeight: visible ? '320px' : '0',
              opacity:   visible ? 1 : 0,
              transition: 'max-height 220ms cubic-bezier(0.16,1,0.3,1), opacity 180ms ease',
            }}
          >
            <div className="border-t border-black/[0.06] py-3 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  aria-current={activeTab === tab ? 'page' : undefined}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-black/[0.04]'
                  }`}
                >
                  {TAB_ICONS[tab]}
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
