/**
 * POST /api/generate-image
 * Body: { text: string }
 * Genererar bild via Gemini Flash Image (gratis tier),
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
    scene = 'teenagers actively playing basketball in a Swedish youth center gym. Show a basketball court with markings, a ball mid-flight, players in sports clothing jumping and shooting, motion blur, indoor sports hall lighting.';
  } else if (is(['fotboll', 'soccer', 'football', 'sparkar', 'mål', 'keeper'])) {
    scene = 'teenagers playing indoor football (futsal) in a Swedish youth center sports hall. Show small goals, ball in motion, players in jerseys, running and kicking, natural indoor light.';
  } else if (is(['baka', 'bakning', 'kaka', 'muffins', 'bröd', 'cookie', 'deg', 'ugn'])) {
    scene = 'teenagers baking together in a modern youth center kitchen. Show mixing bowls, baking trays, flour, ingredients on counter, real kitchen appliances, teens actively mixing and shaping dough, warm kitchen light.';
  } else if (is(['laga mat', 'matlagning', 'kock', 'lagar mat', 'gryta', 'recept', 'kök'])) {
    scene = 'teenagers cooking a meal together in a Swedish youth center kitchen. Show pots on stove, fresh vegetables, teens chopping and stirring, real kitchen environment, warm domestic light.';
  } else if (is(['gaming', 'spela spel', 'playstation', 'xbox', 'nintendo', 'datorspel', 'videospel', 'kontroll'])) {
    scene = 'teenagers playing video games together in a cozy Swedish youth center lounge. Show a big screen TV, gaming controllers, sofas, teenagers reacting with excitement, authentic indoor lighting.';
  } else if (is(['musik', 'sjunga', 'gitarr', 'trummor', 'piano', 'band', 'rep', 'konsert', 'spela musik'])) {
    scene = 'teenagers making music together in a youth center rehearsal room. Show instruments like guitars, drums and keyboard, teens playing and singing, microphone stands, music posters on wall, natural indoor light.';
  } else if (is(['dans', 'dansa', 'hiphop', 'streetdance', 'koreografi', 'breakdance'])) {
    scene = 'teenagers dancing in a Swedish youth center dance studio. Show a mirrored wall, wooden floor, teens mid-movement in dance poses, streetwear clothing, natural indoor light, motion and energy.';
  } else if (is(['pyssel', 'hantverk', 'måla', 'rita', 'konst', 'kreativ', 'craft', 'design'])) {
    scene = 'teenagers doing arts and crafts at a table in a Swedish youth center. Show art supplies, paint, brushes, scissors, teens focused on creating, colorful materials spread on table, warm soft light.';
  } else if (is(['film', 'bio', 'titta', 'kolla film', 'popcorn', 'movie'])) {
    scene = 'teenagers watching a movie together in a youth center screening room. Show teens on sofas with popcorn, dim cinema-style lighting, a projected screen, relaxed and happy expressions.';
  } else if (is(['utflykt', 'natur', 'skog', 'promenad', 'vandring', 'park', 'utomhus'])) {
    scene = 'teenagers on a group outdoor excursion in Swedish nature. Show teens walking on a trail through forest or park, backpacks, casual clothing, sunlight through trees, natural candid photography.';
  } else if (is(['yoga', 'meditation', 'stretching', 'mindfulness', 'avslappning'])) {
    scene = 'teenagers doing yoga or stretching in a calm Swedish youth center room. Show yoga mats, teens in stretch poses, soft natural light, peaceful and focused atmosphere.';
  } else {
    scene = `teenagers actively doing this specific activity: "${text.trim()}". Set in a real Swedish youth center or community center interior. Show teens engaged, realistic props and correct environment, candid documentary style, natural indoor light.`;
  }

  return [
    'Create a photorealistic documentary-style photograph.',
    'Scene:', scene,
    'Style: candid, natural indoor lighting, realistic Swedish youth center setting.',
    'Do NOT show: empty rooms, generic group portraits, stock-photo poses, outdoor landscapes, unrelated activities.',
    'The teenagers must be visibly active and engaged in the specific activity.',
  ].join(' ');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text saknas i body' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!geminiKey || !cloudName || !cloudKey || !cloudSecret) {
    return res.status(500).json({ error: 'Miljovariabler saknas' });
  }

  const prompt = buildPrompt(text);

  // 1. Generera bild via Gemini Flash Image
  let base64;
  let mimeType = 'image/png';
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    );

    if (!geminiRes.ok) {
      const body = await geminiRes.text().catch(() => '');
      return res.status(geminiRes.status).json({ error: `Gemini-fel: ${body}` });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart) {
      return res.status(502).json({ error: 'Ingen bild returnerades fran Gemini Flash' });
    }

    base64 = imagePart.inlineData.data;
    mimeType = imagePart.inlineData.mimeType;
  } catch (err) {
    return res.status(500).json({ error: `Gemini: ${err.message}` });
  }

  // 2. Ladda upp till Cloudinary med signerat anrop
  try {
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
