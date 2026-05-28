/**
 * Gemensamma valideringshjalpare for alla API-routes.
 * Anvands for att sanitera och validera indata innan bearbetning.
 */

/** Max tillaten text-langd for AI-anrop (magic-paste skickar upp till 3000 tecken) */
export const MAX_TEXT_LENGTH = 3000;

/** Max tillaten text-langd for korta AI-anrop (improve-text, bildprompt) */
export const MAX_SHORT_TEXT_LENGTH = 500;

/** Max tillaten publicId-langd */
export const MAX_PUBLIC_ID_LENGTH = 200;

/** Tillatna tecken i Cloudinary publicId (path-safe) */
const PUBLIC_ID_PATTERN = /^[a-zA-Z0-9_\-/\.]+$/;

/**
 * Validerar och sanerar en fritext-strang for AI-anrop.
 * @param {unknown} value
 * @param {number} [maxLen]
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function validateText(value, maxLen = MAX_TEXT_LENGTH) {
  if (!value || typeof value !== 'string') {
    return { ok: false, error: 'text saknas eller har fel typ' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'text far inte vara tom' };
  }
  if (trimmed.length > maxLen) {
    return { ok: false, error: `text far max vara ${maxLen} tecken` };
  }
  return { ok: true, value: trimmed };
}

/**
 * Validerar ett Cloudinary publicId.
 * Forhindrar path traversal och injektionsattacker.
 */
export function validatePublicId(value) {
  if (!value || typeof value !== 'string') {
    return { ok: false, error: 'publicId saknas eller har fel typ' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'publicId far inte vara tomt' };
  }
  if (trimmed.length > MAX_PUBLIC_ID_LENGTH) {
    return { ok: false, error: `publicId far max vara ${MAX_PUBLIC_ID_LENGTH} tecken` };
  }
  if (!PUBLIC_ID_PATTERN.test(trimmed)) {
    return { ok: false, error: 'publicId innehaller otillatna tecken' };
  }
  if (trimmed.includes('..')) {
    return { ok: false, error: 'publicId innehaller otillaten sekvens' };
  }
  return { ok: true, value: trimmed };
}

/**
 * Separata rate-limit-stores per endpoint-kategori.
 * AI-endpoints ar strangare an bildgenerering.
 */
const rateLimitStores = {
  ai:      new Map(),
  image:   new Map(),
  default: new Map(),
};

const RATE_CONFIGS = {
  ai:      { windowMs: 60_000, max: 10 },
  image:   { windowMs: 60_000, max: 5  },
  default: { windowMs: 60_000, max: 20 },
};

/**
 * Kontrollerar om en IP har overskridit rate limit for en given kategori.
 * @param {string} ip
 * @param {'ai'|'image'|'default'} [category]
 * @returns {boolean} true = blockera
 */
export function isRateLimited(ip, category = 'default') {
  const store  = rateLimitStores[category] ?? rateLimitStores.default;
  const config = RATE_CONFIGS[category]    ?? RATE_CONFIGS.default;
  const now    = Date.now();
  const entry  = store.get(ip) || { count: 0, resetAt: now + config.windowMs };

  if (now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + config.windowMs });
    return false;
  }
  entry.count += 1;
  store.set(ip, entry);
  return entry.count > config.max;
}

/**
 * Hamtar klientens IP fran Vercel-request.
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
 * Returnerar true om svaret ar hanterat och handlern bor avbrytas.
 */
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
