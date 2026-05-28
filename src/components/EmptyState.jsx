/**
 * EmptyState — generisk tom-tillstånds-komponent.
 * Används i SchemaView (inga aktiviteter) och överallt annars.
 *
 * Props:
 *   icon      — Lucide-ikonelement (valfritt)
 *   title     — Rubrik (sträng)
 *   body      — Beskrivning (sträng, valfritt)
 *   action    — { label, onClick } (valfritt)
 *   className — extra Tailwind-klasser
 */
import React from 'react';

export function EmptyState({ icon, title, body, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-8 ${className}`}
      role="status"
    >
      {icon && (
        <div className="mb-5 w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
          {React.cloneElement(icon, { className: 'w-7 h-7', strokeWidth: 1.5 })}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {body && <p className="text-sm text-slate-400 max-w-xs mb-6">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
