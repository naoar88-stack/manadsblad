/**
 * aiUtils.js — alla AI-anrop går via /api/* (server-side proxy).
 * GROQ_API_KEY hanteras ENBART på servern och exponeras aldrig i client bundle.
 */

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

/**
 * Intern helper — anropar en /api/-endpoint med POST + JSON.
 * Kastar Error med server-meddelande vid fel.
 */
async function callApi(path, body, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `API-fel: ${res.status}`);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Förfrågan tog för lång tid. Försök igen.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Magic Paste — returnerar array av aktiviteter med dateKey (YYYY-MM-DD).
 * Logiken körs nu server-side i api/magic-paste.js.
 */
export async function magicPaste(rawText, _unusedApiKey, yearMonth) {
  const text = String(rawText ?? '').trim().slice(0, 3000);
  if (!text) throw new Error('Tom text — skriv eller klistra in något.');
  const result = await callApi('/api/magic-paste', { text, yearMonth });
  if (!Array.isArray(result)) throw new Error('Oväntat svar från servern.');
  return result;
}

/**
 * Vässa aktivitetsbeskrivning.
 * Proxar via api/improve-text.js server-side.
 */
export async function vasssa(activity, _unusedApiKey) {
  const text = String(activity?.description || activity?.title || '').trim().slice(0, 500);
  if (!text) throw new Error('Ingen text att förbättra.');
  const data = await callApi('/api/improve-text', { text }, 15000);
  return data.improved ?? '';
}

/**
 * Generera bildprompt.
 * Proxar via api/improve-text.js med ett bildprompt-prefix.
 */
export async function generateImagePrompt(activity, _unusedApiKey) {
  const text = `BILDPROMPT (20 ord engelska): ${activity?.title ?? ''}: ${activity?.description ?? ''}`;
  const data = await callApi('/api/improve-text', { text: text.slice(0, 300) }, 15000);
  return data.improved ?? '';
}

/**
 * generateActivityImage — anropas av useAiActions.
 * Postar till /api/generate-image (server-side Pollinations → Cloudinary)
 * och returnerar { url, publicId }.
 */
export async function generateActivityImage(text) {
  const data = await callApi('/api/generate-image', { text: String(text).slice(0, 200) }, 30000);
  if (!data.url) throw new Error(data.error || 'Bildgenerering misslyckades');
  return { url: data.url, publicId: data.publicId };
}

/**
 * improveActivityText — anropas av useAiActions.
 * Wrapper runt /api/improve-text utan krav på ett fullt activity-objekt.
 */
export async function improveActivityText(text) {
  const data = await callApi('/api/improve-text', { text: String(text).slice(0, 500) }, 15000);
  return data.improved ?? '';
}
