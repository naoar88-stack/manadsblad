const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

const MONTH_MAP = {
  januari:1, februari:2, mars:3, april:4, maj:5, juni:6,
  juli:7, augusti:8, september:9, oktober:10, november:11, december:12,
};

/** Parsar "Maj 2026" eller "2026-05" → { year, month (1-12) } */
function parseYearMonth(yearMonth) {
  if (!yearMonth) {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() + 1 };
  }
  if (/^\d{4}-\d{2}$/.test(yearMonth.trim())) {
    const [y, m] = yearMonth.split('-').map(Number);
    return { year: y, month: m };
  }
  const parts = yearMonth.trim().toLowerCase().split(/\s+/);
  const monthNum = MONTH_MAP[parts[0]];
  const yearNum  = parseInt(parts[1]);
  if (monthNum && yearNum) return { year: yearNum, month: monthNum };
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}

async function callGroq(prompt, apiKey) {
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY saknas — lägg till den i Vercel Environment Variables');
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API-fel: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Magic Paste — returnerar array av aktiviteter med dateKey (YYYY-MM-DD).
 */
export async function magicPaste(rawText, apiKey, yearMonth) {
  const { year, month } = parseYearMonth(yearMonth);

  const WEEKDAY_SV = ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];
  const allDates = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    allDates.push({
      date:    `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
      weekday: WEEKDAY_SV[date.getDay()],
    });
  }

  const calendarContext = allDates
    .map(d => `${d.date} (${d.weekday})`)
    .join(', ');

  const prompt = `Du är en assistent för svenska fritidsgårdar.
Månaden är ${year}-${String(month).padStart(2,'0')} (${yearMonth}).

Kalendern för denna månad — ALLA datum du får använda:
${calendarContext}

DIN UPPGIFT:
Analysera texten nedan och returnera ett JSON-array med aktiviteter.

REGLER (följ exakt):
1. Om texten säger "alla onsdagar" eller "varje onsdag" → skapa EN aktivitet för VARJE onsdag i månaden (använd exakt de onsdagsdatum från kalendern ovan).
2. Om texten säger ett specifikt datum → skapa aktivitet för just det datumet.
3. Använd ALDRIG ett datum som inte finns i kalendern ovan.
4. dateKey MÅSTE vara exakt "YYYY-MM-DD" från kalendern ovan.

Varje objekt ska ha:
- dateKey (string): YYYY-MM-DD från kalendern
- title (string): aktivitetens namn, max 40 tecken
- description (string): kort beskrivning på svenska, max 120 tecken
- ageGroup (string): t.ex. "13–16 år" eller "Alla åldrar"
- badges (object): { signup: bool, cost: bool, trip: bool }

Returnera ENBART ett JSON-array utan kodblock eller förklaring.

Text att analysera:
${rawText}`;

  const raw = await callGroq(prompt, apiKey);

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned);
    const validDates = new Set(allDates.map(d => d.date));
    return parsed.filter(p =>
      p.dateKey &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.dateKey) &&
      validDates.has(p.dateKey)
    );
  } catch {
    const match = raw.match(/\[.*\]/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const validDates = new Set(allDates.map(d => d.date));
      return parsed.filter(p =>
        p.dateKey &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.dateKey) &&
        validDates.has(p.dateKey)
      );
    }
    throw new Error('Kunde inte tolka AI-svaret som JSON');
  }
}

export async function vasssa(activity, apiKey) {
  const prompt = `Förbättra denna aktivitetsbeskrivning för en fritidsgård. Gör den catchy och inbjudande. Max 100 tecken. Bara texten, inget annat:\n${activity.description || activity.title}`;
  return await callGroq(prompt, apiKey);
}

export async function generateImagePrompt(activity, apiKey) {
  const prompt = `Skapa ett kort bildprompt på engelska för en aktivitetsbild. Max 20 ord. Bara prompten:\n${activity.title}: ${activity.description}`;
  return await callGroq(prompt, apiKey);
}

/**
 * Bug 14-fix: generateActivityImage — anropas av useAiActions.
 * Postar till /api/generate-image (server-side Pollinations → Cloudinary)
 * och returnerar { url, publicId }.
 */
export async function generateActivityImage(text) {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: String(text).slice(0, 200) }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || `Bildgenerering misslyckades: ${res.status}`);
  }
  return { url: data.url, publicId: data.publicId };
}

/**
 * Bug 14-fix: improveActivityText — anropas av useAiActions.
 * Wrapper runt vasssa utan krav på ett fullt activity-objekt.
 */
export async function improveActivityText(text) {
  const API_KEY = typeof import.meta !== 'undefined'
    ? import.meta.env?.VITE_GROQ_API_KEY
    : undefined;
  return await callGroq(
    `Förbättra denna aktivitetsbeskrivning för en fritidsgård. Gör den catchy och inbjudande. Max 100 tecken. Bara texten, inget annat:\n${text}`,
    API_KEY,
  );
}
