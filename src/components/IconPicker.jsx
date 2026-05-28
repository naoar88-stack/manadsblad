import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  // Sport
  Dumbbell, Bike, Footprints, Trophy, Target, Swords,
  // Kreativt
  Palette, Scissors, PenLine, Sparkles, Shapes, Camera,
  // Mat
  UtensilsCrossed, Pizza, Cake, Coffee, Apple, Sandwich,
  // Musik
  Music, Mic2, Drum, Guitar, Radio, Headphones,
  // Utomhus
  TreePine, Tent, Flower2, CloudSun, Waves, Mountain,
  // Övrigt
  BookOpen, Gamepad2, Heart, Star, Rocket, Lightbulb,
  Globe, Users, Gift, Clock, Flag, Smile,
} from 'lucide-react';

export const ACTIVITY_ICONS = [
  // Sport
  { id: 'Dumbbell',        label: 'Styrka',      category: 'Sport',    Icon: Dumbbell },
  { id: 'Bike',            label: 'Cykel',       category: 'Sport',    Icon: Bike },
  { id: 'Footprints',      label: 'Promenad',    category: 'Sport',    Icon: Footprints },
  { id: 'Trophy',          label: 'Tävling',     category: 'Sport',    Icon: Trophy },
  { id: 'Target',          label: 'Mål',         category: 'Sport',    Icon: Target },
  { id: 'Swords',          label: 'Kamp',        category: 'Sport',    Icon: Swords },
  // Kreativt
  { id: 'Palette',         label: 'Målning',     category: 'Kreativt', Icon: Palette },
  { id: 'Scissors',        label: 'Pyssel',      category: 'Kreativt', Icon: Scissors },
  { id: 'PenLine',         label: 'Skrivande',   category: 'Kreativt', Icon: PenLine },
  { id: 'Sparkles',        label: 'Skapande',    category: 'Kreativt', Icon: Sparkles },
  { id: 'Shapes',          label: 'Former',      category: 'Kreativt', Icon: Shapes },
  { id: 'Camera',          label: 'Foto',        category: 'Kreativt', Icon: Camera },
  // Mat
  { id: 'UtensilsCrossed', label: 'Matlagning',  category: 'Mat',      Icon: UtensilsCrossed },
  { id: 'Pizza',           label: 'Pizza',       category: 'Mat',      Icon: Pizza },
  { id: 'Cake',            label: 'Bakning',     category: 'Mat',      Icon: Cake },
  { id: 'Coffee',          label: 'Fika',        category: 'Mat',      Icon: Coffee },
  { id: 'Apple',           label: 'Frukt',       category: 'Mat',      Icon: Apple },
  { id: 'Sandwich',        label: 'Lunch',       category: 'Mat',      Icon: Sandwich },
  // Musik
  { id: 'Music',           label: 'Musik',       category: 'Musik',    Icon: Music },
  { id: 'Mic2',            label: 'Sång',        category: 'Musik',    Icon: Mic2 },
  { id: 'Drum',            label: 'Trummor',     category: 'Musik',    Icon: Drum },
  { id: 'Guitar',          label: 'Gitarr',      category: 'Musik',    Icon: Guitar },
  { id: 'Radio',           label: 'Radio',       category: 'Musik',    Icon: Radio },
  { id: 'Headphones',      label: 'Lyssning',    category: 'Musik',    Icon: Headphones },
  // Utomhus
  { id: 'TreePine',        label: 'Skog',        category: 'Utomhus',  Icon: TreePine },
  { id: 'Tent',            label: 'Camping',     category: 'Utomhus',  Icon: Tent },
  { id: 'Flower2',         label: 'Natur',       category: 'Utomhus',  Icon: Flower2 },
  { id: 'CloudSun',        label: 'Utomhus',     category: 'Utomhus',  Icon: CloudSun },
  { id: 'Waves',           label: 'Vatten',      category: 'Utomhus',  Icon: Waves },
  { id: 'Mountain',        label: 'Berg',        category: 'Utomhus',  Icon: Mountain },
  // Övrigt
  { id: 'BookOpen',        label: 'Läsning',     category: 'Övrigt',   Icon: BookOpen },
  { id: 'Gamepad2',        label: 'Spel',        category: 'Övrigt',   Icon: Gamepad2 },
  { id: 'Heart',           label: 'Omsorg',      category: 'Övrigt',   Icon: Heart },
  { id: 'Star',            label: 'Highlight',   category: 'Övrigt',   Icon: Star },
  { id: 'Rocket',          label: 'Projekt',     category: 'Övrigt',   Icon: Rocket },
  { id: 'Lightbulb',       label: 'Idé',         category: 'Övrigt',   Icon: Lightbulb },
  { id: 'Globe',           label: 'Världen',     category: 'Övrigt',   Icon: Globe },
  { id: 'Users',           label: 'Grupp',       category: 'Övrigt',   Icon: Users },
  { id: 'Gift',            label: 'Present',     category: 'Övrigt',   Icon: Gift },
  { id: 'Clock',           label: 'Tid',         category: 'Övrigt',   Icon: Clock },
  { id: 'Flag',            label: 'Evenemang',   category: 'Övrigt',   Icon: Flag },
  { id: 'Smile',           label: 'Kul',         category: 'Övrigt',   Icon: Smile },
];

const CATEGORIES = ['Alla', 'Sport', 'Kreativt', 'Mat', 'Musik', 'Utomhus', 'Övrigt'];

/**
 * IconPicker — popover rutnät för att välja aktivitetsikon.
 *
 * Props:
 *   value    {string|null}  — aktuellt ikon-id (t.ex. "Bike")
 *   onChange {fn}           — anropas med ikon-id (string) eller null
 *   onClose  {fn}           — stäng popovern
 */
export function IconPicker({ value, onChange, onClose }) {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('Alla');
  const containerRef = useRef(null);
  const searchRef    = useRef(null);

  // Fokusera sökfältet när popovern öppnas
  useEffect(() => { searchRef.current?.focus(); }, []);

  // Stäng vid klick utanför
  useEffect(() => {
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [onClose]);

  // Stäng vid Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const filtered = ACTIVITY_ICONS.filter(ic => {
    const matchCat = category === 'Alla' || ic.category === category;
    const matchQ   = !query.trim() || ic.label.toLowerCase().includes(query.trim().toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Välj ikon"
      className="absolute z-50 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex flex-col gap-2"
      style={{ top: '100%', left: 0 }}
    >
      {/* Sök */}
      <input
        ref={searchRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Sök ikon…"
        aria-label="Sök ikon"
        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-300"
      />

      {/* Kategori-filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ikon-rutnät */}
      <div
        className="grid grid-cols-6 gap-1 max-h-52 overflow-y-auto pr-0.5"
        role="listbox"
        aria-label="Ikoner"
      >
        {filtered.length === 0 && (
          <p className="col-span-6 text-center text-xs text-slate-400 py-4">Inga ikoner hittades</p>
        )}
        {filtered.map(({ id, label, Icon }) => {
          const isSelected = value === id;
          return (
            <button
              key={id}
              role="option"
              aria-selected={isSelected}
              title={label}
              aria-label={label}
              onClick={() => { onChange(isSelected ? null : id); onClose(); }}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {/* Rensa-knapp */}
      {value && (
        <button
          onClick={() => { onChange(null); onClose(); }}
          className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1 rounded-xl hover:bg-red-50"
        >
          Rensa ikon
        </button>
      )}
    </div>
  );
}
