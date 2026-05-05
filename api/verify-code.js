import crypto from 'crypto';

// ── STATIC CODES ──
// Pro static codes (permanent, manual issue)
const STATIC_PRO_CODES = new Set([
  'CVAP-PRO1-2026', 'CVAP-PRO2-2026', 'CVAP-PRO3-2026',
  'CVAP-PRO4-2026', 'CVAP-PRO5-2026', 'CVAP-PRO6-2026',
  'CVAP-PRO7-2026', 'CVAP-PRO8-2026', 'CVAP-PRO9-2026',
  'CVAP-PRO0-2026',
]);

// Career+ static codes (permanent, manual issue)
const STATIC_CPLUS_CODES = new Set([
  'CVAP-CPL1-2026', 'CVAP-CPL2-2026', 'CVAP-CPL3-2026',
  'CVAP-CPL4-2026', 'CVAP-CPL5-2026',
]);

// ── DYNAMIC CODE FORMATS ──
// Pro:      CVAP-XXXX-XXXX  (8 alphanum chars across 2 segments)
// Career+:  CVCP-XXXX-XXXX  (different prefix)
function isValidProFormat(code) {
  return /^CVAP-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code);
}
function isValidCareerPlusFormat(code) {
  return /^CVCP-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code);
}

// ── UPSTASH REDIS HELPERS ──
async function redisGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.result ?? null;
  } catch { return null; }
}

async function redisSet(key, value, exSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${exSeconds}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
}

async function redisIncr(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.result ?? null;
  } catch { return null; }
}

async function redisExpire(key, seconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
}

// ── IN-MEMORY FALLBACK ──
const memAttempts = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW_S = 15 * 60;
const RATE_WINDOW_MS = RATE_WINDOW_S * 1000;

async function isRateLimited(ip) {
  const redisKey = `rl:verify:${ip}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;

  if (url && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const current = await redisIncr(redisKey);
    if (current === 1) await redisExpire(redisKey, RATE_WINDOW_S);
    return current !== null && current > RATE_LIMIT;
  }

  const now = Date.now();
  const record = memAttempts.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > record.reset) {
    memAttempts.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  if (record.count >= RATE_LIMIT) return true;
  record.count++;
  memAttempts.set(ip, record);
  return false;
}

async function isCodeAlreadyUsed(code) {
  const val = await redisGet(`used:${code}`);
  return val !== null;
}

async function markCodeUsed(code) {
  await redisSet(`used:${code}`, '1', 60 * 60 * 24 * 730);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (await isRateLimited(ip)) {
    return res.status(429).json({ valid: false, error: 'Too many attempts. Please wait 15 minutes and try again.' });
  }

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'No code provided' });
  }

  const normalised = code.trim().toUpperCase();

  // Determine tier
  const isStaticPro    = STATIC_PRO_CODES.has(normalised);
  const isStaticCPlus  = STATIC_CPLUS_CODES.has(normalised);
  const isDynamicPro   = isValidProFormat(normalised);
  const isDynamicCPlus = isValidCareerPlusFormat(normalised);

  const isValid = isStaticPro || isStaticCPlus || isDynamicPro || isDynamicCPlus;

  if (!isValid) {
    await new Promise(r => setTimeout(r, 500));
    return res.status(200).json({ valid: false, error: 'Invalid code. Please check and try again.' });
  }

  // Single-use check for dynamic codes only
  const isDynamic = isDynamicPro || isDynamicCPlus;
  const isStatic  = isStaticPro  || isStaticCPlus;

  if (isDynamic && !isStatic) {
    const alreadyUsed = await isCodeAlreadyUsed(normalised);
    if (alreadyUsed) {
      await new Promise(r => setTimeout(r, 500));
      return res.status(200).json({
        valid: false,
        error: 'This code has already been used. Each code is single-use. Please contact support if you need help.'
      });
    }
  }

  // Determine tier for token payload
  const tier = (isStaticCPlus || isDynamicCPlus) ? 'career_plus' : 'pro';

  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'cvapplied-fallback-secret';
  const payload = `${normalised}:${Date.now()}:${tier}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const token = `${Buffer.from(payload).toString('base64')}.${sig}`;

  if (isDynamic && !isStatic) {
    await markCodeUsed(normalised);
  }

  return res.status(200).json({ valid: true, token, tier });
}
