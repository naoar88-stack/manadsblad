/**
 * EmptyState — generisk tom-tillstånds-komponent.
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
      className={`flex flex-col items-center justify-center text-center py-20 px-8 animate-in ${className}`}
      role="status"
    >
      {icon && (
        <div
          className="mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%)',
            border: '1px solid rgba(91,120,246,0.15)',
          }}
        >
          {React.cloneElement(icon, { className: 'w-7 h-7 text-brand-500', strokeWidth: 1.5 })}
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      {body && (
        <p className="text-sm text-slate-400 font-medium max-w-[280px] mb-7 leading-relaxed">{body}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary px-5 h-10 text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
