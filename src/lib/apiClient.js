/**
 * Klient som anropar Vercel API-endpoints.
 * Faller tillbaka på direkt Gemini-anrop om backend inte är konfigurerad
 * (lokalt utan .env).
 */

async function post(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function improveText(text) {
  const { result } = await post('/api/improve-text', { text });
  return result;
}

export async function generateImage(text) {
  const { url, publicId } = await post('/api/generate-image', { text });
  return { url, publicId };
}

export async function deleteImage(publicId) {
  await post('/api/delete-image', { publicId });
}
