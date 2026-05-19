function groupDaysIntoWeeks(days) {
  const weeks = [];
  let currentWeek = [];

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 3) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length) weeks.push(currentWeek);
  return weeks;
}

const FORMAT_CONFIG = {
  'a4-landscape': {
    label: 'A4 liggande',
    className: 'format-a4-landscape',
    intro: 'Välkommen till månadens aktiviteter. Här hittar du veckans öppna träffar, skapande stunder och gemensamma kvällar på gården.',
    empty: 'Ingen aktivitet planerad ännu.',
  },
  'a4-portrait': {
    label: 'A4 stående',
    className: 'format-a4-portrait',
    intro: 'Här är månadens planering för gården med aktiviteter, bilder och tider att dela med besökare och vårdnadshavare.',
    empty: 'Ingen aktivitet planerad ännu.',
  },
  'instagram-post': {
    label: 'Instagram post',
    className: 'format-instagram-post',
    intro: 'Månadens höjdpunkter på gården.',
    empty: 'Mer info kommer snart.',
  },
  'instagram-story': {
    label: 'Instagram story',
    className: 'format-instagram-story',
    intro: 'Veckans aktiviteter och öppna träffar.',
    empty: 'Håll utkik efter uppdateringar.',
  },
};

function trimText(text, format) {
  const limits = {
    'a4-landscape': 160,
    'a4-portrait': 120,
    'instagram-post': 72,
    'instagram-story': 56,
  };
  const limit = limits[format] || 120;
  const clean = (text || '').trim();
  if (!clean) return '';
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean;
}

function getCardTone(day) {
  const textLength = (day.text || '').trim().length;
  const hasImage = Boolean(day.image);
  if (hasImage && textLength > 90) return 'card-feature';
  if (hasImage) return 'card-visual';
  if (textLength > 80) return 'card-text-heavy';
  return 'card-compact';
}

function orderWeekCards(week) {
  const decorated = week.map((day) => ({
    ...day,
    tone: getCardTone(day),
  }));

  const priority = {
    'card-feature': 0,
    'card-visual': 1,
    'card-text-heavy': 2,
    'card-compact': 3,
  };

  return decorated.sort((a, b) => priority[a.tone] - priority[b.tone]);
}

function splitHeadline(text) {
  const clean = (text || '').trim();
  if (!clean) return { title: '', body: '' };
  const lines = clean.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { title: lines[0], body: lines.slice(1).join(' ') };
  }
  if (clean.includes('. ')) {
    const [first, ...rest] = clean.split('. ');
    return { title: first, body: rest.join('. ') };
  }
  return { title: clean, body: '' };
}

export default function ExportCanvas({ state, exportRef }) {
  const weeks = groupDaysIntoWeeks(state.days);
  const currentFormat = FORMAT_CONFIG[state.selectedFormat] || FORMAT_CONFIG['a4-landscape'];

  return (
    <section className="export-stage panel">
      <div className="export-toolbar">
        <div>
          <span className="eyebrow">Exportförhandsvisning</span>
          <h3>Kommunalt månadsblad</h3>
        </div>
        <div className="export-meta">
          <span>{state.selectedYear}</span>
          <span>{currentFormat.label}</span>
        </div>
      </div>

      <div ref={exportRef} className={`export-canvas municipal-sheet ${currentFormat.className}`}>
        <header className="sheet-header">
          <div className="sheet-brand">
            <div className="sheet-mark" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <rect x="10" y="10" width="44" height="44" rx="14" stroke="currentColor" strokeWidth="3" />
                <path d="M22 37L32 23L42 37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26 41H38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p>Fritidsgård</p>
              <h1>{state.headerTitle}</h1>
            </div>
          </div>
          <div className="sheet-period">
            <span>Månadsprogram</span>
            <strong>{new Date(state.selectedYear, state.selectedMonth).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}</strong>
          </div>
        </header>

        <div className="sheet-intro">
          <p>{currentFormat.intro}</p>
        </div>

        <div className="sheet-weeks">
          {weeks.map((week, index) => {
            const orderedWeek = orderWeekCards(week);
            const hasFeature = orderedWeek.some((day) => day.tone === 'card-feature');
            return (
              <section key={index} className={`sheet-week ${hasFeature ? 'sheet-week-highlight' : ''}`}>
                <div className="sheet-week-header">
                  <span>Vecka {index + 1}</span>
                </div>
                <div className="sheet-week-grid">
                  {orderedWeek.map((day) => {
                    const summary = trimText(day.text, state.selectedFormat);
                    const { title, body } = splitHeadline(summary);
                    return (
                      <article key={day.dateKey} className={`sheet-card ${day.tone}`}>
                        {day.image ? (
                          <img src={day.image} alt={`Aktivitet för ${day.weekdayLabel} ${day.dayNum}`} className="sheet-card-image" />
                        ) : (
                          <div className="sheet-card-placeholder">Ingen bild vald</div>
                        )}
                        <div className="sheet-card-content">
                          <div className="sheet-card-topline">
                            <div className="sheet-card-daygroup">
                              <strong>{day.weekdayLabel} {day.dayNum}</strong>
                              <small>{day.dateKey}</small>
                            </div>
                            <span>{day.ageGroup}</span>
                          </div>
                          <div className="sheet-card-copy">
                            <h4>{title || currentFormat.empty}</h4>
                            {body && <p>{body}</p>}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="sheet-footer">
          <div>
            <strong>Kontakt</strong>
            <p>{state.footerText}</p>
          </div>
          <div>
            <strong>Trygg mötesplats</strong>
            <p>Öppet för unga med fokus på gemenskap, kreativitet och delaktighet.</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
