/**
 * POST /api/generate-image
 * Body: { text: string }
 * Genererar bild via Pollinations.ai (gratis, ingen API-nyckel krävs),
 * laddar upp till Cloudinary och returnerar { url, publicId }.
 */
import crypto from 'crypto';

function cloudinarySignature(params, secret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha256').update(sorted + secret).digest('hex');
}

/**
 * Klassificerar aktivitetstext och returnerar en skraddarsydd bildprompt.
 */
function buildPrompt(text) {
  const t = text.toLowerCase();
  const is = (keywords) => keywords.some((kw) => t.includes(kw));

  let scene = '';

  if (is(['basket', 'basketball', 'dribbla', 'skjut', 'korg', 'hoops'])) {
    scene = 'teenagers playing basketball in a Swedish youth center gym, ball mid-flight, indoor court markings, motion blur, sports clothing, photorealistic';
  } else if (is(['fotboll', 'soccer', 'football', 'sparkar', 'mål', 'keeper'])) {
    scene = 'teenagers playing indoor football futsal in Swedish youth center sports hall, ball in motion, running, photorealistic';
  } else if (is(['baka', 'bakning', 'kaka', 'muffins', 'bröd', 'cookie', 'deg', 'ugn'])) {
    scene = 'teenagers baking together in youth center kitchen, mixing bowls, flour, baking trays, warm light, photorealistic';
  } else if (is(['laga mat', 'matlagning', 'kock', 'gryta', 'recept', 'kök'])) {
    scene = 'teenagers cooking together in Swedish youth center kitchen, pots on stove, vegetables, warm light, photorealistic';
  } else if (is(['gaming', 'spela spel', 'playstation', 'xbox', 'nintendo', 'datorspel', 'videospel', 'kontroll'])) {
    scene = 'teenagers playing video games together in youth center lounge, controllers, big screen TV, excited expressions, photorealistic';
  } else if (is(['musik', 'sjunga', 'gitarr', 'trummor', 'piano', 'band', 'rep', 'konsert'])) {
    scene = 'teenagers playing music together in youth center rehearsal room, guitars drums keyboard, microphone, photorealistic';
  } else if (is(['dans', 'dansa', 'hiphop', 'streetdance', 'koreografi', 'breakdance'])) {
    scene = 'teenagers dancing in youth center dance studio, mirrored wall, wooden floor, mid-movement, streetwear, photorealistic';
  } else if (is(['pyssel', 'hantverk', 'måla', 'rita', 'konst', 'kreativ', 'craft'])) {
    scene = 'teenagers doing arts and crafts at table in youth center, paint brushes art supplies, focused, colorful, photorealistic';
  } else if (is(['film', 'bio', 'titta', 'popcorn', 'movie'])) {
    scene = 'teenagers watching movie together in youth center screening room, popcorn, dim lighting, projected screen, photorealistic';
  } else if (is(['utflykt', 'natur', 'skog', 'promenad', 'vandring', 'park', 'utomhus'])) {
    scene = 'teenagers on outdoor excursion in Swedish nature, forest trail, backpacks, sunlight through trees, photorealistic';
  } else if (is(['yoga', 'meditation', 'stretching', 'mindfulness', 'avslappning'])) {
    scene = 'teenagers doing yoga stretching in calm youth center room, yoga mats, soft natural light, photorealistic';
  } else {
    scene = `teenagers at Swedish youth center doing: ${text.trim()}, candid documentary style, natural indoor light, photorealistic`;
  }

  return scene;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text saknas i body' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !cloudKey || !cloudSecret) {
    return res.status(500).json({ error: 'Cloudinary-variabler saknas' });
  }

  const prompt = buildPrompt(text);
  const encodedPrompt = encodeURIComponent(prompt);

  // 1. Generera bild via Pollinations.ai (gratis, ingen nyckel)
  let imageBuffer;
  let mimeType = 'image/jpeg';
  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=900&height=600&nologo=true&model=flux`;
    const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(25000) });

    if (!imgRes.ok) {
      return res.status(imgRes.status).json({ error: `Pollinations-fel: ${imgRes.status}` });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
    mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
  } catch (err) {
    return res.status(500).json({ error: `Pollinations: ${err.message}` });
  }

  // 2. Ladda upp till Cloudinary med signerat anrop
  try {
    const base64 = imageBuffer.toString('base64');
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'manadsblad/ai';
    const sigParams = { folder, timestamp };
    const signature = cloudinarySignature(sigParams, cloudSecret);

    const formData = new FormData();
    formData.append('file', `data:${mimeType};base64,${base64}`);
    formData.append('api_key', cloudKey);
    formData.append('timestamp', timestamp);
    formData.append('folder', folder);
    formData.append('signature', signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      return res.status(500).json({ error: `Cloudinary: ${uploadData?.error?.message || 'okant fel'}` });
    }

    return res.status(200).json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
