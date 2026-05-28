/**
 * Gemensamma valideringshjälpare för alla API-routes.
 * Används för att sanitera och validera indata innan bearbetning.
 */

/** Max tillåten text-längd för AI-anrop */
export const MAX_TEXT_LENGTH = 500;

/** Max tillåten publicId-längd */
export const MAX_PUBLIC_ID_LENGTH = 200;

/** Tillåtna tecken i Cloudinary publicId (path-safe) */
const PUBLIC_ID_PATTERN = /^[a-zA-Z0-9_\-/\.]+$/;

/**
 * Validerar och sanerar en fritext-sträng för AI-anrop.
 * @param {unknown} value
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function validateText(value) {
  if (!value || typeof value !== 'string') {
    return { ok: false, error: 'text saknas eller har fel typ' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'text får inte vara tom' };
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: `text får max vara ${MAX_TEXT_LENGTH} tecken` };
  }
  return { ok: true, value: trimmed };
}

/**
 * Validerar ett Cloudinary publicId.
 * Förhindrar path traversal och injektionsattacker.
 * @param {unknown} value
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function validatePublicId(value) {
  if (!value || typeof value !== 'string') {
    return { ok: false, error: 'publicId saknas eller har fel typ' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'publicId får inte vara tomt' };
  }
  if (trimmed.length > MAX_PUBLIC_ID_LENGTH) {
    return { ok: false, error: `publicId får max vara ${MAX_PUBLIC_ID_LENGTH} tecken` };
  }
  if (!PUBLIC_ID_PATTERN.test(trimmed)) {
    return { ok: false, error: 'publicId innehåller otillåtna tecken' };
  }
  // Förhindra path traversal
  if (trimmed.includes('..')) {
    return { ok: false, error: 'publicId innehåller otillåten sekvens' };
  }
  return { ok: true, value: trimmed };
}

/**
 * Enkel in-memory rate limiter per IP.
 * Håller max MAX_REQUESTS anrop per WINDOW_MS.
 * OBS: återställs vid serverless cold start — tillräckligt för grundskydd.
 */
const rateLimitStore = new Map();
const WINDOW_MS = 60_000; // 1 minut
const MAX_REQUESTS = 20;  // max 20 anrop/minut/IP

/**
 * Kontrollerar om en IP har överskridit rate limit.
 * @param {string} ip
 * @returns {boolean} true = blockera
 */
export function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    // Fönstret har passerat — återställ
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return entry.count > MAX_REQUESTS;
}

/**
 * Hämtar klientens IP från Vercel-request.
 * @param {import('@vercel/node').VercelRequest} req
 * @returns {string}
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Hanterar CORS preflight (OPTIONS).
 * Returnerar true om svaret är hanterat och handlern bör avbrytas.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @returns {boolean}
 */
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
