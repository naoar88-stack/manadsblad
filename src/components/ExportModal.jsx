import React from 'react';
import { Share2, Download } from 'lucide-react';

export const ExportModal = ({ isOpen, onClose, schedule }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" />
            Exportera till Instagram
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 items-center justify-center bg-slate-100/50">
          <div className="w-[400px] h-[400px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-none shadow-xl flex flex-col p-6 text-white relative">
            <h3 className="text-3xl font-black mb-6 uppercase tracking-wider">Februari på Gården</h3>
            <div className="flex flex-col gap-3 overflow-hidden">
              {Object.entries(schedule).slice(0, 4).map(([day, acts]) => (
                <div key={day} className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                  <div className="bg-white text-indigo-600 font-bold w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm">
                    {day}
                  </div>
                  <div className="flex flex-col">
                    {acts.map(a => (
                      <span key={a.uniqueId} className="font-semibold text-sm flex items-center gap-1">
                        {a.icon} {a.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(schedule).length > 4 && (
                <p className="text-center text-white/70 text-sm mt-2 font-medium">...och mycket mer! Se hela bladet i bion.</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-4 max-w-xs">
            <h4 className="font-bold text-slate-800">Redo att publiceras!</h4>
            <p className="text-sm text-slate-600">Detta är en förhandsgranskning. I nästa steg kopplar vi in html2canvas för att ladda ner denna bild.</p>
            <button className="mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.39)]">
              <Download className="w-5 h-5" />
              Ladda ner bild
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
