// Groq API — gratis, inget kreditkort, extremt snabb
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant'; // aktuell gratis modell
async function callGroq(prompt, apiKey) {
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY saknas — lagg till den i Vercel Environment Variables');
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
  const prompt = `Du ar en assistent for svenska fritidsgardar.
Analysera foljande text och extrahera alla aktiviteter du hittar.
Returnera ENBART ett JSON-array (ingen forklarande text, inga markdown-kodblock) med objekt som har dessa falt:
- title (string): aktivitetens namn
- description (string, max 120 tecken): kort beskrivning pa svenska
- dateHint (string): datum eller dag som namns (t.ex. "15 juni", "fredagar", tom strang om okant)
- ageGroup (string): aldersgrupp, t.ex. "13-16 ar", "Alla aldrar" om okant
- badges (object): { signup: bool, cost: bool, trip: bool } baserat pa texten

Text att analysera:
${rawText}`;
  const raw = await callGroq(prompt, apiKey);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\[.*\]/s);
    if (match) return JSON.parse(match[0]);
    throw new Error('Kunde inte tolka AI-svaret som JSON');
  }
}

export async function vasssa(activity, apiKey) {
  const prompt = `Forbattra denna aktivitetsbeskrivning for en fritidsgard. Max 100 tecken. Bara texten, inget annat:
${activity.description || activity.title}`;
  return await callGroq(prompt, apiKey);
}

export async function generateImagePrompt(activity, apiKey) {
  const prompt = `Skapa ett kort bildprompt pa engelska for en aktivitetsbild. Max 20 ord. Bara prompten:
${activity.title}: ${activity.description}`;
  return await callGroq(prompt, apiKey);
}
