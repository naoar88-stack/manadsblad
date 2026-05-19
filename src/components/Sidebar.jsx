import { CalendarDays, KeyRound, LayoutTemplate, Settings2 } from 'lucide-react';
import { WEEKDAYS, TEMPLATES } from '../data/constants';
import { getMonthName } from '../lib/dateUtils';

export default function Sidebar({ state }) {
  const toggleWeekday = (id) => {
    state.setActiveWeekdays((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort()
    );
  };

  return (
    <aside className="sidebar">
      <div className="brand municipal-brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="6" y="6" width="36" height="36" rx="12" stroke="currentColor" strokeWidth="2.5" />
            <path d="M16 28L24 16L32 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 30H29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <span className="eyebrow">Kommunal planering</span>
          <h1>Manadsblad</h1>
          <p>En lugn, tydlig studio för att planera aktiviteter, bilder och export för fritidsgården.</p>
        </div>
      </div>

      <div className="section panel sidebar-panel">
        <div className="section-title"><CalendarDays size={16} /> Innehåll</div>
        <div className="field">
          <label>Rubrik</label>
          <input value={state.headerTitle} onChange={(e) => state.setHeaderTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Sidfot</label>
          <input value={state.footerText} onChange={(e) => state.setFooterText(e.target.value)} />
        </div>
      </div>

      <div className="section panel sidebar-panel">
        <div className="section-title"><Settings2 size={16} /> Period</div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Månad</label>
            <select value={state.selectedMonth} onChange={(e) => state.setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 110 }}>
            <label>År</label>
            <input type="number" value={state.selectedYear} onChange={(e) => state.setSelectedYear(Number(e.target.value))} />
          </div>
        </div>
        <div className="weekday-wrap row">
          {WEEKDAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`btn chip ${state.activeWeekdays.includes(day.id) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleWeekday(day.id)}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section panel sidebar-panel">
        <div className="section-title"><LayoutTemplate size={16} /> Stil</div>
        <div className="field">
          <label>Mall</label>
          <select value={state.selectedTemplate} onChange={(e) => state.setSelectedTemplate(e.target.value)}>
            {TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section panel sidebar-panel">
        <div className="section-title"><LayoutTemplate size={16} /> Exportformat</div>
        <div className="field">
          <label>Format</label>
          <select value={state.selectedFormat} onChange={(e) => state.setSelectedFormat(e.target.value)}>
            <option value="a4-landscape">A4 liggande</option>
            <option value="a4-portrait">A4 stående</option>
            <option value="instagram-post">Instagram post</option>
            <option value="instagram-story">Instagram story</option>
          </select>
        </div>
      </div>

      <div className="section panel sidebar-panel">
        <div className="section-title"><KeyRound size={16} /> AI</div>
        <div className="field">
          <label>Gemini API-nyckel</label>
          <input
            type="password"
            value={state.geminiApiKey}
            onChange={(e) => state.setGeminiApiKey(e.target.value)}
            placeholder="Klistra in nyckel för riktig AI"
          />
        </div>
        <p className="helper-text">
          När fältet är tomt kör appen fallback-läge för text och bild. När en nyckel finns används riktiga AI-anrop.
        </p>
      </div>
    </aside>
  );
}
