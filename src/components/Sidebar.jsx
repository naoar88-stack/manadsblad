import React from 'react';
import { Wand2, GripVertical, Plus } from 'lucide-react';

export const Sidebar = ({ templates, onCreateTemplate }) => {
  const handleDragStart = (e, template) => {
    e.dataTransfer.setData('application/json', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-full md:w-72 bg-slate-50 p-6 border-r border-slate-200 flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-500" />
          Aktiviteter
        </h2>
        <p className="text-sm text-slate-500 mt-1">Dra och släpp i kalendern</p>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pb-20">
        {templates.map(template => (
          <div
            key={template.id}
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            className={`p-4 rounded-2xl flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] transition-all border border-white hover:border-slate-100 ${template.color} bg-opacity-50 backdrop-blur-sm`}
          >
            <GripVertical className="w-4 h-4 opacity-50" />
            <span className="text-xl">{template.icon}</span>
            <span className="font-semibold text-sm">{template.title}</span>
          </div>
        ))}

        <button
          onClick={onCreateTemplate}
          className="mt-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-100 hover:border-indigo-300 hover:text-indigo-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Skapa ny mall</span>
        </button>
      </div>
    </div>
  );
};
