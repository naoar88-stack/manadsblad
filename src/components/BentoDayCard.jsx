import React, { useState, memo } from 'react';
import { Trash2 } from 'lucide-react';

export const BentoDayCard = memo(function BentoDayCard({ day, activities, onDropActivity, onRemoveActivity }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative min-h-[120px] p-4 rounded-3xl transition-all duration-200 border flex flex-col gap-2
        ${
          isOver
            ? 'bg-indigo-50 border-indigo-200 scale-[1.02] shadow-inner'
            : 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-lg font-bold text-slate-700">{day}</span>
        {activities?.length > 0 && (
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
            {activities.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        {activities?.map((act) => (
          <div
            key={act.uniqueId}
            className={`group flex items-center justify-between p-2 rounded-xl text-xs font-medium ${act.color} bg-opacity-40`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span>{act.icon}</span>
              <span className="truncate">{act.title}</span>
            </div>
            <button
              onClick={() => onRemoveActivity(day, act.uniqueId)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded-md transition-all text-slate-600"
              aria-label={`Ta bort ${act.title}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
