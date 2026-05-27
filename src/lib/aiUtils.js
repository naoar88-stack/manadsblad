// Groq API — gratis, inget kreditkort, extremt snabb
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

async function callGroq(prompt, apiKey) {
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY saknas — lägg till den i Vercel Environment Variables');
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.4, max_tokens: 2048 }),
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
 * Expanderar veckodagsregler ("alla onsdagar = matlagning") till ALLA matchande datum i månaden.
 */
export async function magicPaste(rawText, apiKey, yearMonth) {
  const [y, m] = (yearMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const WEEKDAY_SV = ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];
  const allDates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m - 1, d);
    allDates.push({
      date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
      weekday: WEEKDAY_SV[date.getDay()]
    });
  }
  const calendarContext = allDates.map(d => `${d.date} (${d.weekday})`).join(', ');

  const prompt = `Du är en assistent för svenska fritidsgårdar. Månaden är ${yearMonth}.

Kalendern för denna månad: ${calendarContext}

Din uppgift: Analysera texten nedan och returnera ett JSON-array med aktiviteter.
VIKTIGT: Om texten nämner en veckodag (t.ex. "onsdagar", "alla fredagar", "torsdagar kl 15")
ska du skapa EN aktivitet för VARJE sådant datum i månaden ovan.
Om texten nämner ett specifikt datum, skapa aktivitet för just det datumet.

Varje objekt i arrayen ska ha dessa fält:
- dateKey (string): datum i formatet YYYY-MM-DD (OBLIGATORISKT — använd exakt ett datum från kalendern ovan)
- title (string): aktivitetens namn, max 40 tecken
- description (string): kort beskrivning på svenska, max 120 tecken
- ageGroup (string): t.ex. "13-16 år" eller "Alla åldrar"
- badges (object): { signup: bool, cost: bool, trip: bool }

Returnera ENBART ett JSON-array, inga kodblock, ingen förklaring.

Text att analysera:
${rawText}`;

  const raw = await callGroq(prompt, apiKey);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.filter(p => p.dateKey && /^\d{4}-\d{2}-\d{2}$/.test(p.dateKey));
  } catch {
    const match = raw.match(/\[.*\]/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return parsed.filter(p => p.dateKey && /^\d{4}-\d{2}-\d{2}$/.test(p.dateKey));
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
