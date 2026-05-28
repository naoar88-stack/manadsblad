/**
 * POST /api/generate-image
 * Body: { text: string }
 * Genererar bild via Pollinations.ai, laddar upp till Cloudinary.
 * Returns: { url, publicId }
 */
import crypto from 'crypto';
import { validateText, isRateLimited, getClientIp, handleCors } from './_lib/validate.js';

function cloudinarySignature(params, secret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha256').update(sorted + secret).digest('hex');
}

function buildPrompt(text) {
  const t = text.toLowerCase();
  const is = (keywords) => keywords.some((kw) => t.includes(kw));

  if (is(['basket', 'basketball', 'dribbla', 'skjut', 'korg', 'hoops']))
    return 'teenagers playing basketball in a Swedish youth center gym, ball mid-flight, indoor court markings, motion blur, sports clothing, photorealistic';
  if (is(['fotboll', 'soccer', 'football', 'sparkar', 'mål', 'keeper']))
    return 'teenagers playing indoor football futsal in Swedish youth center sports hall, ball in motion, running, photorealistic';
  if (is(['baka', 'bakning', 'kaka', 'muffins', 'bröd', 'cookie', 'deg', 'ugn']))
    return 'teenagers baking together in youth center kitchen, mixing bowls, flour, baking trays, warm light, photorealistic';
  if (is(['laga mat', 'matlagning', 'kock', 'gryta', 'recept', 'kök']))
    return 'teenagers cooking together in Swedish youth center kitchen, pots on stove, vegetables, warm light, photorealistic';
  if (is(['gaming', 'spela spel', 'playstation', 'xbox', 'nintendo', 'datorspel', 'videospel', 'kontroll']))
    return 'teenagers playing video games together in youth center lounge, controllers, big screen TV, excited expressions, photorealistic';
  if (is(['musik', 'sjunga', 'gitarr', 'trummor', 'piano', 'band', 'rep', 'konsert']))
    return 'teenagers playing music together in youth center rehearsal room, guitars drums keyboard, microphone, photorealistic';
  if (is(['dans', 'dansa', 'hiphop', 'streetdance', 'koreografi', 'breakdance']))
    return 'teenagers dancing in youth center dance studio, mirrored wall, wooden floor, mid-movement, streetwear, photorealistic';
  if (is(['pyssel', 'hantverk', 'måla', 'rita', 'konst', 'kreativ', 'craft']))
    return 'teenagers doing arts and crafts at table in youth center, paint brushes art supplies, focused, colorful, photorealistic';
  if (is(['film', 'bio', 'titta', 'popcorn', 'movie']))
    return 'teenagers watching movie together in youth center screening room, popcorn, dim lighting, projected screen, photorealistic';
  if (is(['utflykt', 'natur', 'skog', 'promenad', 'vandring', 'park', 'utomhus']))
    return 'teenagers on outdoor excursion in Swedish nature, forest trail, backpacks, sunlight through trees, photorealistic';
  if (is(['yoga', 'meditation', 'stretching', 'mindfulness', 'avslappning']))
    return 'teenagers doing yoga stretching in calm youth center room, yoga mats, soft natural light, photorealistic';

  return `teenagers at Swedish youth center doing: ${text.slice(0, 120).trim()}, candid documentary style, natural indoor light, photorealistic`;
}

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

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !cloudKey || !cloudSecret) {
    return res.status(500).json({ error: 'Konfigurationsfel på servern' });
  }

  const prompt = buildPrompt(text);
  const encodedPrompt = encodeURIComponent(prompt);

  // 1. Hämta bild från Pollinations.ai
  let imageBuffer;
  let mimeType = 'image/jpeg';
  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=900&height=600&nologo=true&model=flux`;
    const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(25000) });

    if (!imgRes.ok) {
      return res.status(502).json({ error: 'Kunde inte generera bild just nu' });
    }

    // Verifiera att svaret faktiskt är en bild
    const contentType = imgRes.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(502).json({ error: 'Oväntat svar från bildgeneratorn' });
    }

    mimeType = contentType.split(';')[0].trim();
    const arrayBuffer = await imgRes.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);

    // Storleksgräns: max 10 MB
    if (imageBuffer.byteLength > 10 * 1024 * 1024) {
      return res.status(502).json({ error: 'Genererad bild för stor' });
    }
  } catch (err) {
    return res.status(504).json({ error: 'Timeout vid bildgenerering' });
  }

  // 2. Ladda upp till Cloudinary
  try {
    const base64 = imageBuffer.toString('base64');
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'manadsblad/ai';
    const sigParams = { folder, timestamp };
    const signature = cloudinarySignature(sigParams, cloudSecret);

    const formData = new FormData();
    formData.append('file', `data:${mimeType};base64,${base64}`);
    formData.append('api_key', cloudKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('signature', signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData, signal: AbortSignal.timeout(20000) }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      return res.status(502).json({ error: 'Kunde inte ladda upp bild' });
    }

    return res.status(200).json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
    });
  } catch (err) {
    return res.status(504).json({ error: 'Timeout vid bilduppladdning' });
  }
}
