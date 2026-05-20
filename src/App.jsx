import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

import { useSchedule } from './hooks/useSchedule';
import { Sidebar } from './components/Sidebar';
import { BentoDayCard } from './components/BentoDayCard';
import { ExportModal } from './components/ExportModal';
import { CreateTemplateModal } from './components/CreateTemplateModal';

// Hjälpfunktioner för månadshantering
const MONTH_NAMES_SV = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
];

function toMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexerat

  const currentMonthKey = toMonthKey(year, month);
  const monthLabel = `${MONTH_NAMES_SV[month]} ${year}`;
  const daysInMonth = getDaysInMonth(year, month);

  const {
    schedule,
    templates,
    addActivityToDay,
    removeActivityFromDay,
    addTemplate,
    isLoading,
  } = useSchedule(currentMonthKey);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Ansluter till databasen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col md:flex-row">

      <Sidebar
        templates={templates}
        onCreateTemplate={() => setIsCreateTemplateOpen(true)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Månadsblad <span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            {/* Månadsväljare */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-700 min-w-[130px] text-center">
                {monthLabel}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              <ImageIcon className="w-4 h-4" />
              Förhandsgranska Export
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <BentoDayCard
                  key={`${currentMonthKey}-${day}`}
                  day={day}
                  activities={schedule[day]}
                  onDropActivity={addActivityToDay}
                  onRemoveActivity={removeActivityFromDay}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        schedule={schedule}
        monthLabel={monthLabel}
      />

      <CreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        onSave={addTemplate}
      />
    </div>
  );
}
