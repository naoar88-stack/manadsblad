async function fetchWithBackoff(url, options) {
  const delays = [1000, 2000, 4000];
  let lastError;
  for (let i = 0; i <= delays.length; i += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${body}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (i === delays.length) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
  }
  throw lastError;
}

function getApiKey() {
  return typeof window !== 'undefined' ? window.__GEMINI_API_KEY || '' : '';
}

export async function improveActivityText(text) {
  const apiKey = getApiKey();
  const base = text.trim() || 'Aktivitet';

  if (!apiKey) {
    const lines = base.split('\n').filter(Boolean);
    const title = lines[0] || 'Aktivitet';
    const body = lines.slice(1).join(' ').trim() || 'Kom och häng med oss under kvällen.';
    return `${title}\n${body.slice(0, 90)}${body.length > 90 ? '...' : ''}`;
  }

  const prompt = `Förbättra texten för ett svenskt månadsblad för fritidsgård. Behåll tonen varm, tydlig och kort. Svara med exakt två rader: rad 1 rubrik, rad 2 kort beskrivning. Text: ${base}`;

  const response = await fetchWithBackoff(
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

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || base;
}

export async function generateActivityImage(text) {
  const apiKey = getApiKey();
  const seed = encodeURIComponent((text || 'aktivitet').toLowerCase().trim().replace(/\s+/g, '-'));

  if (!apiKey) {
    return `https://picsum.photos/seed/${seed}/900/600`;
  }

  const prompt = `Photorealistic youth center activity in Sweden: ${text || 'youth activity'}, friendly, vibrant, safe environment, documentary photography`;

  const response = await fetchWithBackoff(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 },
      }),
    }
  );

  const data = await response.json();
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) {
    return `https://picsum.photos/seed/${seed}/900/600`;
  }
  return `data:image/png;base64,${base64}`;
}
