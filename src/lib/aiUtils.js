const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt, apiKey) {
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY saknas i .env');
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API-fel: ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function magicPaste(rawText, apiKey) {
  const prompt = `Du är en assistent för svenska fritidsgårdar.
Analysera följande text och extrahera alla aktiviteter du hittar.
Returnera ENBART ett JSON-array (ingen förklarande text, inga markdown-kodblock) med objekt som har dessa fält:
- title (string): aktivitetens namn
- description (string, max 120 tecken): kort beskrivning på svenska
- dateHint (string): datum eller dag som nämns (t.ex. "15 juni", "fredagar", tom sträng om okänt)
- ageGroup (string): åldersgrupp, t.ex. "13–16 år", "Alla åldrar" om okänt
- badges (object): { signup: bool, cost: bool, trip: bool } baserat på texten

Text:
${rawText}

Svara ENBART med JSON-arrayen.`;

  const raw = await callGemini(prompt, apiKey);
  const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returnerade ogiltig JSON. Försök igen.');
  }
}

export async function vasssa(activity, apiKey) {
  const prompt = `Du är en copywriter för svenska fritidsgårdar. Din uppgift är att göra aktivitetstexter mer engagerande, tydliga och inbjudande för ungdomar.

Aktivitet:
Titel: ${activity.title}
Beskrivning: ${activity.description}
Åldersgrupp: ${activity.ageGroup || 'okänd'}

Returnera ENBART ett JSON-objekt (inga kodblock) med:
- title (string): en slagkraftig, kortfattad titel (max 6 ord)
- description (string): engagerande beskrivning på svenska (max 120 tecken)

Svara ENBART med JSON-objektet.`;

  const raw = await callGemini(prompt, apiKey);
  const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returnerade ogiltig JSON. Försök igen.');
  }
}

export async function generateImagePrompt(activity, apiKey) {
  const prompt = `Skapa en kort engelsk söksträng (5–8 ord) för Unsplash som passar denna fritidsgårdsaktivitet:
Titel: ${activity.title}
Beskrivning: ${activity.description}
Returnera ENBART söktexten, ingen annan text.`;
  return callGemini(prompt, apiKey);
}
