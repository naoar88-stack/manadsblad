import React from 'react';

/**
 * EmptyState — generisk tom-tillstånds-komponent.
 * Props:
 *   icon      — emoji eller React-nod
 *   title     — rubrik
 *   message   — förklarande text
 *   action    — { label, onClick } knappkonfiguration
 *   compact   — boolean, smalare padding
 */
export function EmptyState({ icon, title, message, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 px-6'
      }`}
      role="status"
      aria-label={title}
    >
      {/* Icon / illustration */}
      {icon && (
        <div
          className="mb-4 select-none"
          style={{
            fontSize: compact ? '2rem' : '2.75rem',
            lineHeight: 1,
            animation: 'emptyStateBounce 2.4s cubic-bezier(0.36,0.07,0.19,0.97) infinite',
            display: 'inline-block',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3
          className="font-bold text-slate-700 mb-1.5"
          style={{ fontSize: compact ? '0.9375rem' : '1rem' }}
        >
          {title}
        </h3>
      )}

      {/* Message */}
      {message && (
        <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed mb-5">
          {message}
        </p>
      )}

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary px-5 text-sm"
          style={{ minHeight: '40px' }}
        >
          {action.label}
        </button>
      )}

      <style>{`
        @keyframes emptyStateBounce {
          0%, 100% { transform: translateY(0); }
          40%       { transform: translateY(-6px); }
          60%       { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes emptyStateBounce { 0%, 100% { transform: none; } }
        }
      `}</style>
    </div>
  );
}
