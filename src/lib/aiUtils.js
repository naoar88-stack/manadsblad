// Groq API — gratis, inget kreditkort, extremt snabb (Llama 3.3 70B)
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

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
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API-fel: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
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

  const raw = await callGroq(prompt, apiKey);
  const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returnerade ogiltig JSON. Försök igen.');
  }
}

export async function vasssa(activity, apiKey) {
  const prompt = `Du är en copywriter för svenska fritidsgårdar. Gör aktivitetstexter mer engagerande och inbjudande för ungdomar.

Aktivitet:
Titel: ${activity.title}
Beskrivning: ${activity.description}
Åldersgrupp: ${activity.ageGroup || 'okänd'}

Returnera ENBART ett JSON-objekt (inga kodblock) med:
- title (string): slagkraftig titel (max 6 ord)
- description (string): engagerande beskrivning på svenska (max 120 tecken)

Svara ENBART med JSON-objektet.`;

  const raw = await callGroq(prompt, apiKey);
  const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returnerade ogiltig JSON. Försök igen.');
  }
}

export async function generateImagePrompt(activity, apiKey) {
  const prompt = `Skapa en kort engelsk söksträng (5–8 ord) för Unsplash som passar denna fritidsgårdsaktivitet:
Titel: ${activity.title}
Beskrivning: ${activity.description}
Returnera ENBART söktexten, ingen annan text.`;
  return callGroq(prompt, apiKey);
}
