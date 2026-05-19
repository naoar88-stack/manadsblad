/**
 * POST /api/improve-text
 * Body: { text: string }
 * Proxya Gemini text-förbättring – API-nyckeln lever aldrig i klienten.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text saknas i body' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY är inte konfigurerad' });
  }

  const prompt = `Förbättra texten för ett svenskt månadsblad för fritidsgård. Behåll tonen varm, tydlig och kort. Svara med exakt två rader: rad 1 rubrik, rad 2 kort beskrivning. Text: ${text.trim()}`;

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
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `Gemini-fel: ${body}` });
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
