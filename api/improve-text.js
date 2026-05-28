/**
 * POST /api/improve-text
 * Body: { text: string }
 * Proxya Gemini text-förbättring – API-nyckeln lever aldrig i klienten.
 */
import { validateText, isRateLimited, getClientIp, handleCors } from './_lib/validate.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'För många förfrågningar. Försök igen om en stund.' });
  }

  // Validera input
  const textResult = validateText(req.body?.text);
  if (!textResult.ok) {
    return res.status(400).json({ error: textResult.error });
  }
  const text = textResult.value;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Konfigurationsfel på servern' });
  }

  const prompt = `Förbättra texten för ett svenskt månadsblad för fritidsgård. Behåll tonen varm, tydlig och kort. Svara med exakt två rader: rad 1 rubrik, rad 2 kort beskrivning. Text: ${text}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      // Exponera INTE rå body — den kan innehålla API-nyckel i felmeddelanden
      return res.status(502).json({ error: `Textförbättring misslyckades (${response.status})` });
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
    return res.status(200).json({ result });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Tidsgräns nådd vid textförbättring' });
    }
    return res.status(500).json({ error: 'Textförbättring misslyckades' });
  }
}
