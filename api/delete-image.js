/**
 * POST /api/delete-image
 * Body: { publicId: string }
 * Signerad borttagning av bild från Cloudinary.
 */
import crypto from 'crypto';
import { validatePublicId, isRateLimited, getClientIp, handleCors } from './_lib/validate.js';

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

  // Validera och sanera publicId — förhindrar path traversal / injection
  const idResult = validatePublicId(req.body?.publicId);
  if (!idResult.ok) {
    return res.status(400).json({ error: idResult.error });
  }
  const publicId = idResult.value;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !cloudKey || !cloudSecret) {
    return res.status(500).json({ error: 'Konfigurationsfel på servern' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const sigString = `public_id=${publicId}&timestamp=${timestamp}${cloudSecret}`;
  const signature = crypto.createHash('sha256').update(sigString).digest('hex');

  const form = new URLSearchParams();
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('api_key', cloudKey);
  form.append('signature', signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await response.json();
    if (data.result === 'ok' || data.result === 'not found') {
      return res.status(200).json({ ok: true });
    }
    return res.status(502).json({ error: 'Kunde inte ta bort bilden' });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Tidsgräns nådd vid bildborttagning' });
    }
    return res.status(500).json({ error: 'Bildborttagning misslyckades' });
  }
}
