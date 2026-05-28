import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

let _id = 0;

const CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
    wrapClass: 'bg-white border-emerald-200/80',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-500',
    barClass: 'bg-red-500',
    wrapClass: 'bg-white border-red-200/80',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    barClass: 'bg-amber-500',
    wrapClass: 'bg-white border-amber-200/80',
  },
  info: {
    icon: Info,
    iconClass: 'text-indigo-500',
    barClass: 'bg-indigo-500',
    wrapClass: 'bg-white border-indigo-200/80',
  },
};

const DURATION = 3800;

function Toast({ id, type = 'info', message, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef(null);
  const cfg = CONFIG[type] || CONFIG.info;
  const Icon = cfg.icon;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 180);
  }, [id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, DURATION);

    function tick() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [dismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border shadow-lg overflow-hidden
        min-w-[280px] max-w-[360px] w-full
        ${ cfg.wrapClass }
        ${ exiting ? 'toast-exit' : 'toast-enter' }`}
      style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)' }}
    >
      {/* Progress bar */}
      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-[2px] ${cfg.barClass} transition-none`}
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
      />

      <Icon size={16} className={`shrink-0 ${cfg.iconClass}`} aria-hidden="true" />

      <p className="text-sm font-semibold text-slate-800 flex-1 leading-snug">{message}</p>

      <button
        onClick={dismiss}
        className="shrink-0 h-7 w-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all"
        aria-label="Stäng notis"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((message, type = 'info') => {
    const id = ++_id;
    setToasts(t => [...t.slice(-3), { id, message, type }]); // max 4 synliga
  }, []);
  toast.success = msg => toast(msg, 'success');
  toast.error   = msg => toast(msg, 'error');
  toast.warning = msg => toast(msg, 'warning');
  toast.info    = msg => toast(msg, 'info');

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-label="Notiser"
        aria-live="polite"
        className="fixed z-[9999] flex flex-col-reverse items-center gap-2 pointer-events-none"
        style={{
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
