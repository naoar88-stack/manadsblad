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

  const prompt = `Photorealistic youth center activity in Sweden: ${text.trim()}, friendly, vibrant, safe environment, documentary photography`;

  // 1. Generera bild via Gemini Flash Image
  let base64;
  let mimeType = 'image/png';

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiKey}`,
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
