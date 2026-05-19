/**
 * POST /api/delete-image
 * Body: { publicId: string }
 * Signerad borttagning av bild från Cloudinary.
 */
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body || {};
  if (!publicId || typeof publicId !== 'string') {
    return res.status(400).json({ error: 'publicId saknas i body' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !cloudKey || !cloudSecret) {
    return res.status(500).json({ error: 'Miljövariabler saknas' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const sigString = `public_id=${publicId}&timestamp=${timestamp}${cloudSecret}`;
  const signature = crypto.createHash('sha256').update(sigString).digest('hex');

  const form = new URLSearchParams();
  form.append('public_id', publicId);
  form.append('timestamp', timestamp);
  form.append('api_key', cloudKey);
  form.append('signature', signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      }
    );

    const data = await response.json();
    if (data.result === 'ok' || data.result === 'not found') {
      return res.status(200).json({ ok: true });
    }
    return res.status(500).json({ error: `Cloudinary svarade: ${data.result}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
