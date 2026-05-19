import { ImagePlus, Sparkles, Wand2 } from 'lucide-react';
import { AGE_GROUPS } from '../data/constants';

export default function CalendarEditor({ days, updateActivity, openLibrary, ai }) {
  if (!days.length) {
    return <div className="panel empty">Inga aktiva dagar valda för den här månaden.</div>;
  }

  return (
    <div className="calendar-grid">
      {days.map((day) => {
        const isImproving = Boolean(ai.improvingMap[day.dateKey]);
        const isGenerating = Boolean(ai.generatingMap[day.dateKey]);

        return (
          <article key={day.dateKey} className="panel day-card">
            {day.image && (
              <img
                className="day-image"
                src={day.image}
                alt={`Illustration för ${day.weekdayLabel} ${day.dayNum}`}
              />
            )}

            <header>
              <div>
                <h3>{day.weekdayLabel} {day.dayNum}</h3>
                <small>{day.dateKey}</small>
              </div>
              <span className="badge">{day.ageGroup}</span>
            </header>

            <textarea
              value={day.text}
              placeholder="Skriv aktivitet, t.ex. Turnering, matlagning eller filmkväll"
              onChange={(e) => updateActivity(day.dateKey, { text: e.target.value })}
              aria-label={`Aktivitetstext för ${day.weekdayLabel} ${day.dayNum}`}
            />

            <div className="field age-field">
              <label htmlFor={`age-${day.dateKey}`}>Åldersgrupp</label>
              <select
                id={`age-${day.dateKey}`}
                value={day.ageGroup}
                onChange={(e) => updateActivity(day.dateKey, { ageGroup: e.target.value })}
              >
                {AGE_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="row day-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openLibrary(day.dateKey)}
                aria-label={`Välj bild för ${day.weekdayLabel} ${day.dayNum}`}
              >
                <ImagePlus size={16} /> Bild
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => ai.improveTextForDay(day)}
                disabled={isImproving}
                aria-label={`Förbättra text för ${day.weekdayLabel} ${day.dayNum}`}
              >
                <Sparkles size={16} /> {isImproving ? 'Förbättrar...' : 'Förbättra'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => ai.generateImageForDay(day)}
                disabled={isGenerating}
                aria-label={`Generera AI-bild för ${day.weekdayLabel} ${day.dayNum}`}
              >
                <Wand2 size={16} /> {isGenerating ? 'Skapar...' : 'AI-bild'}
              </button>
              {day.image && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => updateActivity(day.dateKey, { image: null })}
                  aria-label={`Ta bort bild för ${day.weekdayLabel} ${day.dayNum}`}
                >
                  Ta bort bild
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
