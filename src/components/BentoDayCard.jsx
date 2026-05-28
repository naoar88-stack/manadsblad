import React, { useState, memo } from 'react';
import { Trash2 } from 'lucide-react';

export const BentoDayCard = memo(function BentoDayCard({ day, activities, onDropActivity, onRemoveActivity }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const activityData = JSON.parse(e.dataTransfer.getData('application/json'));
      onDropActivity(day, activityData);
    } catch (err) {
      console.error('Kunde inte läsa drag-data', err);
    }
  };

  const isEmpty = !activities || activities.length === 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative min-h-[128px] p-4 rounded-2xl flex flex-col gap-2 transition-all duration-200 ${
        isOver ? 'drag-over' : 'day-card'
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-base font-extrabold text-slate-800 tabular-nums leading-none"
        >
          {day}
        </span>
        {activities?.length > 0 && (
          <span
            className="badge badge-slate"
            aria-label={`${activities.length} aktiviteter`}
          >
            {activities.length}
          </span>
        )}
      </div>

      {/* Activities */}
      <div className="flex flex-col gap-1.5 flex-grow">
        {isEmpty ? (
          <div
            className="flex-1 flex items-center justify-center min-h-[56px] rounded-xl border-2 border-dashed transition-all duration-200"
            style={{
              borderColor: isOver ? 'rgba(99,102,241,0.45)' : 'rgba(15,23,42,0.08)',
              background: isOver ? 'rgba(99,102,241,0.04)' : 'transparent',
            }}
            aria-hidden="true"
          >
            <span
              className="text-xs font-medium select-none transition-all duration-150"
              style={{ color: isOver ? 'rgb(99,102,241)' : 'rgb(148,163,184)' }}
            >
              {isOver ? '✦ Släpp här' : 'Dra aktivitet hit'}
            </span>
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.uniqueId}
              className={`group activity-pill justify-between ${act.color} bg-opacity-50`}
            >
              <div className="flex items-center gap-1.5 truncate min-w-0">
                <span className="text-sm leading-none flex-shrink-0">{act.icon}</span>
                <span className="truncate text-xs font-semibold">{act.title}</span>
              </div>
              <button
                onClick={() => onRemoveActivity(day, act.uniqueId)}
                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ml-1 p-1 hover:bg-white/60 active:bg-white/80 active:scale-90 rounded-md transition-all flex-shrink-0"
                aria-label={`Ta bort ${act.title}`}
                tabIndex={0}
              >
                <Trash2 size={12} aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
