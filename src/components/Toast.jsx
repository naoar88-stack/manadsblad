import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

let _id = 0;

const ICONS = {
  success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
  error:   <AlertCircle  size={16} className="text-red-500 shrink-0" />,
  info:    <Info         size={16} className="text-indigo-500 shrink-0" />,
};
const COLORS = {
  success: 'border-emerald-200 bg-emerald-50',
  error:   'border-red-200 bg-red-50',
  info:    'border-indigo-200 bg-indigo-50',
};

function Toast({ id, type = 'info', message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 3500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-sm ${COLORS[type]}`}>
      {ICONS[type]}
      <p className="text-sm font-semibold text-slate-800 flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="text-slate-400 hover:text-slate-600 transition shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((message, type = 'info') => {
    const id = ++_id;
    setToasts(t => [...t, { id, message, type }]);
  }, []);
  toast.success = msg => toast(msg, 'success');
  toast.error   = msg => toast(msg, 'error');
  toast.info    = msg => toast(msg, 'info');

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
