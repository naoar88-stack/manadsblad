import { improveText, generateImage } from './apiClient';

/**
 * Förbättra aktivitetstext.
 * Anropar /api/improve-text (Vercel serverless).
 */
export async function improveActivityText(text) {
  const base = text.trim() || 'Aktivitet';
  try {
    return await improveText(base);
  } catch (err) {
    console.warn('improveActivityText misslyckades, använder fallback:', err.message);
    // Enkel lokal fallback om backend inte svarar
    const lines = base.split('\n').filter(Boolean);
    const title = lines[0] || 'Aktivitet';
    const body = lines.slice(1).join(' ').trim() || 'Kom och häng med oss under kvällen.';
    return `${title}\n${body.slice(0, 90)}${body.length > 90 ? '...' : ''}`;
  }
}

/**
 * Generera aktivitetsbild.
 * Anropar /api/generate-image (Vercel serverless).
 * Returnerar { url, publicId }.
 */
export async function generateActivityImage(text) {
  const seed = encodeURIComponent((text || 'aktivitet').toLowerCase().trim().replace(/\s+/g, '-'));
  try {
    return await generateImage(text || 'youth activity');
  } catch (err) {
    console.warn('generateActivityImage misslyckades, använder fallback:', err.message);
    return {
      url: `https://picsum.photos/seed/${seed}/900/600`,
      publicId: null,
    };
  }
}
