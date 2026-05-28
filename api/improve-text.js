/**
 * POST /api/improve-text
 * Body: { text: string }
 * Proxar Groq-anrop server-side — API-nyckeln exponeras aldrig i client bundle.
 * Returns: { improved: string }
 */
import { validateText, isRateLimited, getClientIp, handleCors } from './_lib/validate.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'För många förfrågningar. Försök igen om en stund.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI-tjänsten är inte konfigurerad på servern.' });
  }

  const textResult = validateText(req.body?.text, 500);
  if (!textResult.ok) {
    return res.status(400).json({ error: textResult.error });
  }
  const text = textResult.value;

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: `Förbättra denna aktivitetsbeskrivning för en fritidsgård. Gör den catchy och inbjudande. Max 100 tecken. Bara texten, inget annat:\n${text}`,
        }],
        temperature: 0.5,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || `Groq API-fel: ${groqRes.status}` });
    }

    const data     = await groqRes.json();
    const improved = (data.choices?.[0]?.message?.content ?? '').trim().slice(0, 100);

    return res.status(200).json({ improved });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'AI-tjänsten svarade inte i tid.' });
    }
    return res.status(500).json({ error: 'Internt serverfel' });
  }
}
