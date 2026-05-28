/**
 * POST /api/improve-text
 * Body: { text: string }
 * Proxar Groq-anrop server-side - API-nyckeln exponeras aldrig i client bundle.
 * Returns: { improved: string }
 */
import { validateText, isRateLimited, getClientIp, handleCors, MAX_SHORT_TEXT_LENGTH } from './_lib/validate.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  // Strikt rate limit for AI-endpoints: 10 req/min/IP
  if (isRateLimited(ip, 'ai')) {
    return res.status(429).json({ error: 'For manga forfrågningar. Forsok igen om en stund.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI-tjansten ar inte konfigurerad pa servern.' });
  }

  // Korta AI-anrop: max 500 tecken
  const textResult = validateText(req.body?.text, MAX_SHORT_TEXT_LENGTH);
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
        messages: [
          {
            role: 'system',
            content: 'Du ar en assistent for fritidsgard. Forbattra aktivitetsbeskrivningar pa svenska. Svara BARA med den forbattrade texten, inga forklaringar.',
          },
          { role: 'user', content: text },
        ],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => '');
      console.error('Groq error', groqRes.status, errBody.slice(0, 200));
      return res.status(502).json({ error: 'AI-tjansten svarade inte korrekt.' });
    }

    const data = await groqRes.json();
    const improved = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!improved) {
      return res.status(502).json({ error: 'Tomt svar fran AI.' });
    }

    return res.status(200).json({ improved });
  } catch (err) {
    console.error('improve-text error:', err?.message);
    return res.status(500).json({ error: 'Internt serverfel.' });
  }
}
