import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const COLOR_OPTIONS = [
  { label: 'Rosa', value: 'bg-pink-100 text-pink-700' },
  { label: 'Blå', value: 'bg-blue-100 text-blue-700' },
  { label: 'Lila', value: 'bg-purple-100 text-purple-700' },
  { label: 'Grön', value: 'bg-green-100 text-green-700' },
  { label: 'Gul', value: 'bg-yellow-100 text-yellow-700' },
  { label: 'Orange', value: 'bg-orange-100 text-orange-700' },
  { label: 'Röd', value: 'bg-red-100 text-red-700' },
  { label: 'Cyan', value: 'bg-cyan-100 text-cyan-700' },
];

const EMOJI_SUGGESTIONS = ['🎨', '🎮', '✨', '🎧', '🍿', '⚽', '📚', '🎵', '🎪', '🥑', '🌼', '💎', '🚀', '🎉', '👩‍🎤', '🏋️', '📸', '🧐'];

export const CreateTemplateModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎨');
  const [color, setColor] = useState('bg-pink-100 text-pink-700');
  const [customIcon, setCustomIcon] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), icon: customIcon.trim() || icon, color });
    setTitle('');
    setIcon('🎨');
    setColor('bg-pink-100 text-pink-700');
    setCustomIcon('');
    onClose();
  };

  const activeIcon = customIcon.trim() || icon;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Skapa ny mall
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Förhandsgranskning */}
          <div className="flex items-center justify-center">
            <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm border border-white ${color}`}>
              <span className="text-2xl">{activeIcon}</span>
              <span>{title || 'Din mall'}</span>
            </div>
          </div>

          {/* Titel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Filmkväll..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              maxLength={30}
            />
          </div>

          {/* Ikon */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setIcon(e); setCustomIcon(''); }}
                  className={`text-xl p-2 rounded-xl transition-all border-2 ${
                    icon === e && !customIcon
                      ? 'border-indigo-400 bg-indigo-50 scale-110'
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customIcon}
              onChange={(e) => setCustomIcon(e.target.value)}
              placeholder="Eller klistra in egen emoji..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              maxLength={4}
            />
          </div>

          {/* Färg */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Färg</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${c.value} ${
                    color === c.value ? 'border-slate-500 scale-105' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.35)]"
          >
            Spara mall
          </button>
        </div>
      </div>
    </div>
  );
};
