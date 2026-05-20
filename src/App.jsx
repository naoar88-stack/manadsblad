import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Importera våra nya komponenter och hooks
import { useSchedule } from './hooks/useSchedule';
import { Sidebar } from './components/Sidebar';
import { BentoDayCard } from './components/BentoDayCard';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Använd custom hook för att hålla state rent
  const { schedule, templates, addActivityToDay, removeActivityFromDay } = useSchedule();
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Generera dagar för kalendern (exempel för 28 dagar)
  const daysInMonth = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* Vänster meny */}
      <Sidebar templates={templates} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Månadsblad <span className="text-indigo-600">Pro</span></h1>
            <p className="text-sm font-medium text-slate-500">Februari 2026</p>
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

        {/* Bento Grid Kalender */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {daysInMonth.map((day) => (
                <BentoDayCard 
                  key={day} 
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

      {/* Modal för Export */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        schedule={schedule}
      />
    </div>
  );
}
