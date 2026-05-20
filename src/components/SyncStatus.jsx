import React from 'react';
import { Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';

export function SyncStatus({ status }) {
  // status: 'saving' | 'saved' | 'offline' | 'local'
  const map = {
    saving:  { icon: Loader2,       color: 'text-indigo-500', label: 'Sparar…',          spin: true  },
    saved:   { icon: CheckCircle2,  color: 'text-emerald-600', label: 'Sparat',            spin: false },
    offline: { icon: CloudOff,      color: 'text-amber-500',   label: 'Offline-läge',      spin: false },
    local:   { icon: Cloud,         color: 'text-slate-400',   label: 'Lokalt läge',       spin: false },
  };
  const { icon: Icon, color, label, spin } = map[status] ?? map.saved;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon className={`w-3.5 h-3.5 ${spin ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
