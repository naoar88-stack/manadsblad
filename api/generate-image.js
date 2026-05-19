/**
 * POST /api/generate-image
 * Body: { text: string }
 * Genererar bild via Gemini Imagen, laddar upp till Cloudinary,
 * returnerar { url } – ingen base64 når klienten.
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
    return res.status(500).json({ error: 'Miljövariabler saknas' });
  }

  const prompt = `Photorealistic youth center activity in Sweden: ${text}, friendly, vibrant, safe environment, documentary photography`;

  // 1. Generera bild via Imagen
  let base64;
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 },
        }),
      }
    );
    if (!geminiRes.ok) {
      const body = await geminiRes.text().catch(() => '');
      return res.status(geminiRes.status).json({ error: `Imagen-fel: ${body}` });
    }
    const geminiData = await geminiRes.json();
    base64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
    if (!base64) return res.status(502).json({ error: 'Ingen bild från Imagen' });
  } catch (err) {
    return res.status(500).json({ error: `Gemini: ${err.message}` });
  }

  // 2. Ladda upp till Cloudinary med signerat anrop
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'manadsblad/ai';
    const sigParams = { folder, timestamp };
    const signature = cloudinarySignature(sigParams, cloudSecret);

    const form = new FormData();
    form.append('file', `data:image/png;base64,${base64}`);
    form.append('folder', folder);
    form.append('timestamp', timestamp);
    form.append('api_key', cloudKey);
    form.append('signature', signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    );

    if (!uploadRes.ok) {
      const body = await uploadRes.text().catch(() => '');
      return res.status(uploadRes.status).json({ error: `Cloudinary upload-fel: ${body}` });
    }

    const uploadData = await uploadRes.json();
    return res.status(200).json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
    });
  } catch (err) {
    return res.status(500).json({ error: `Cloudinary: ${err.message}` });
  }
}
