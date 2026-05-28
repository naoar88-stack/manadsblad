/**
 * POST /api/magic-paste
 * Body: { text: string, yearMonth: string }
 * Proxar Groq-anrop server-side sa att API-nyckeln aldrig exponeras i client bundle.
 * Returns: JSON-array med aktiviteter
 */
import { validateText, isRateLimited, getClientIp, handleCors } from './_lib/validate.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

const MONTH_MAP = {
  januari:1, februari:2, mars:3, april:4, maj:5, juni:6,
  juli:7, augusti:8, september:9, oktober:10, november:11, december:12,
};

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

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Strikt rate limit for AI-endpoints: 10 req/min/IP
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'ai')) {
    return res.status(429).json({ error: 'For manga forfragningar. Forsok igen om en stund.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI-tjansten ar inte konfigurerad pa servern.' });
  }

  // Validera text-input (max 3000 tecken for magic-paste)
  const textResult = validateText(req.body?.text, 3000);
  if (!textResult.ok) {
    return res.status(400).json({ error: textResult.error });
  }
  const rawText = textResult.value;

  const yearMonth = typeof req.body?.yearMonth === 'string'
    ? req.body.yearMonth.slice(0, 20)
    : null;
  const { year, month } = parseYearMonth(yearMonth);

  // Bygg kalenderkontext
  const WEEKDAY_SV = ['sondag','mandag','tisdag','onsdag','torsdag','fredag','lordag'];
  const allDates = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    allDates.push({
      date: `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
      weekday: WEEKDAY_SV[date.getDay()],
    });
  }
  const calendarContext = allDates.map(d => `${d.date} (${d.weekday})`).join(', ');

  const prompt = `Du ar en assistent for svenska fritidsgards. Manaden ar ${year}-${String(month).padStart(2,'0')} (${yearMonth || ''}).

Kalendern for denna manad - ALLA datum du far anvanda:
${calendarContext}

DIN UPPGIFT: Analysera texten nedan och returnera ett JSON-array med aktiviteter.

REGLER (folj exakt):
1. Om texten sager "alla onsdagar" eller "varje onsdag" - skapa EN aktivitet for VARJE onsdag i manaden.
2. Om texten sager ett specifikt datum - skapa aktivitet for just det datumet.
3. Anvand ALDRIG ett datum som inte finns i kalendern ovan.
4. dateKey MASTE vara exakt "YYYY-MM-DD" fran kalendern ovan.

Varje objekt ska ha:
- dateKey (string): YYYY-MM-DD fran kalendern
- title (string): aktivitetens namn, max 40 tecken
- description (string): kort beskrivning pa svenska, max 120 tecken
- ageGroup (string): t.ex. "13-16 ar" eller "Alla aldrar"
- badges (object): { signup: bool, cost: bool, trip: bool }

Returnera ENBART ett JSON-array utan kodblock eller forklaring.

Text att analysera:
${rawText}`;

  try {
    const groqRes = await fetch(GROQ_URL, {
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
      signal: AbortSignal.timeout(25000),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || `Groq API-fel: ${groqRes.status}` });
    }

    const data = await groqRes.json();
    const raw  = data.choices?.[0]?.message?.content ?? '';

    let parsed;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = raw.match(/\[.*\]/s);
      if (!match) return res.status(502).json({ error: 'Kunde inte tolka AI-svaret som JSON' });
      parsed = JSON.parse(match[0]);
    }

    const validDates = new Set(allDates.map(d => d.date));
    const filtered = (Array.isArray(parsed) ? parsed : []).filter(p =>
      p &&
      typeof p.dateKey === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.dateKey) &&
      validDates.has(p.dateKey) &&
      typeof p.title === 'string' &&
      p.title.length <= 40
    );

    return res.status(200).json(filtered);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'AI-tjansten svarade inte i tid. Forsok igen.' });
    }
    return res.status(500).json({ error: 'Internt serverfel' });
  }
}
