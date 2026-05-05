import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;

// ── PRICE ID TO PLAN MAPPING ──
// Set these in Vercel env vars from your Stripe dashboard
const PRICE_MAP = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY]:    { name: 'Pro Monthly',        tier: 'pro' },
  [process.env.STRIPE_PRICE_PRO_ANNUAL]:     { name: 'Pro Annual',         tier: 'pro' },
  [process.env.STRIPE_PRICE_CPLUS_MONTHLY]:  { name: 'Career+ Monthly',    tier: 'career_plus' },
  [process.env.STRIPE_PRICE_CPLUS_ANNUAL]:   { name: 'Career+ Annual',     tier: 'career_plus' },
};

// ── CODE GENERATION ──
function generateCode(tier) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  // Pro: CVAP-XXXX-XXXX   Career+: CVCP-XXXX-XXXX
  const prefix = tier === 'career_plus' ? 'CVCP' : 'CVAP';
  return `${prefix}-${seg(4)}-${seg(4)}`;
}

// ── EMAIL TEMPLATES ──
function buildEmailHtml(code, planName, tier) {
  const isCareerPlus = tier === 'career_plus';
  const accentColor  = isCareerPlus ? '#7c3aed' : '#1a56db';
  const badgeBg      = isCareerPlus ? '#f3e8ff' : '#e8effe';
  const activationUrl = isCareerPlus
    ? 'https://www.cvapplied.com/career-plus.html'
    : 'https://www.cvapplied.com/analyse.html';
  const activationStep = isCareerPlus
    ? 'Go to <a href="https://www.cvapplied.com/career-plus.html" style="color:' + accentColor + ';">cvapplied.com/career-plus.html</a>'
    : 'Go to <a href="https://www.cvapplied.com/analyse.html" style="color:' + accentColor + ';">cvapplied.com/analyse.html</a> and analyse your CV — after the report loads, scroll to the bottom';

  const extraFeatures = isCareerPlus ? `
    <div style="background:#fafaf8;border-radius:10px;padding:20px 24px;margin:24px 0;">
      <p style="font-size:0.85rem;font-weight:700;color:#3a3d4a;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Your Career+ features</p>
      <ul style="color:#3a3d4a;font-size:0.88rem;line-height:2;margin:0;padding-left:18px;">
        <li>Unlimited CV analyses</li>
        <li>All 15 role-based templates</li>
        <li>One-click job tailoring</li>
        <li>PDF &amp; DOCX export</li>
        <li><strong>Cover Letter Generator</strong> — AI-written, matched to any job</li>
        <li><strong>LinkedIn Profile Optimiser</strong> — headline, About, and keyword gaps</li>
        <li><strong>Interview Prep Guide</strong> — tailored questions from your CV and JD</li>
      </ul>
    </div>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e4e4e0;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#0f1117;padding:28px 36px;">
            <span style="font-size:1.4rem;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">CV<span style="color:${accentColor};">Applied</span></span>
            ${isCareerPlus ? '<span style="margin-left:10px;background:' + accentColor + ';color:#fff;font-size:0.65rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:3px 9px;border-radius:4px;">Career+</span>' : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="font-size:1rem;color:#3a3d4a;margin:0 0 20px;">Hi there,</p>
            <p style="font-size:1rem;color:#3a3d4a;margin:0 0 20px;">
              Thank you for subscribing to <strong>CVApplied ${planName}</strong>. Your access code is ready below.
            </p>
            <div style="background:${badgeBg};border:2px solid ${accentColor};border-radius:12px;padding:24px;text-align:center;margin:28px 0;">
              <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${accentColor};margin:0 0 10px;">Your Access Code</p>
              <p style="font-size:2rem;font-weight:700;font-family:'Courier New',monospace;color:#0f1117;letter-spacing:0.12em;margin:0;">${code}</p>
            </div>
            ${extraFeatures}
            <p style="font-size:0.95rem;color:#3a3d4a;margin:0 0 16px;font-weight:600;">How to activate:</p>
            <ol style="color:#3a3d4a;font-size:0.9rem;line-height:1.8;margin:0 0 24px;padding-left:20px;">
              <li>${activationStep}</li>
              <li>Click <strong>"I have an access code"</strong></li>
              <li>Enter your code above to unlock full ${isCareerPlus ? 'Career+' : 'Pro'} access</li>
            </ol>
            <p style="font-size:0.85rem;color:#7a7f8e;margin:0 0 8px;">Keep this email safe — your code is unique to you.</p>
            <p style="font-size:0.85rem;color:#7a7f8e;margin:0;">Questions? Reply to this email and we'll help.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f6fa;padding:20px 36px;border-top:1px solid #e4e4e0;">
            <p style="font-size:0.75rem;color:#7a7f8e;margin:0;">
              CVApplied · Built for UK job seekers &#127468;&#127463; ·
              <a href="https://www.cvapplied.com" style="color:${accentColor};">cvapplied.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendAccessCodeEmail(email, code, planName, tier) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'CVApplied <info@cvapplied.com>',
        to: [email],
        subject: `Your CVApplied ${planName} access code`,
        html: buildEmailHtml(code, planName, tier)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend error');
    console.log(`Email sent to ${email}. ID: ${data.id}`);
  } catch (err) {
    console.error('Resend error:', err);
  }
}

async function tagCustomerInConvertKit(email, tier) {
  const CK_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CK_FORM_ID = process.env.CONVERTKIT_FORM_ID;
  if (!CK_API_KEY || !CK_FORM_ID) return;
  const tag = tier === 'career_plus' ? 'cvapplied-career-plus' : 'cvapplied-pro';
  try {
    await fetch(`https://api.convertkit.com/v3/forms/${CK_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: CK_API_KEY, email, tags: [tag] })
    });
  } catch (err) {
    console.error('ConvertKit tag error:', err);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return res.status(200).json({ received: true });
  }

  // Resolve plan from price ID, fall back to amount heuristic
  const lineItemPriceId = session.line_items?.data?.[0]?.price?.id;
  let plan = PRICE_MAP[lineItemPriceId] || null;

  if (!plan) {
    const amt = session.amount_total;
    if (amt >= 29900)     plan = { name: 'Career+ Annual',  tier: 'career_plus' };
    else if (amt >= 3900) plan = { name: 'Career+ Monthly', tier: 'career_plus' };
    else if (amt >= 8900) plan = { name: 'Pro Annual',      tier: 'pro' };
    else                  plan = { name: 'Pro Monthly',     tier: 'pro' };
  }

  const code = generateCode(plan.tier);

  console.log(`[ISSUED_CODE] email=${customerEmail} code=${code} plan=${plan.name} tier=${plan.tier} session=${session.id}`);

  await Promise.all([
    sendAccessCodeEmail(customerEmail, code, plan.name, plan.tier),
    tagCustomerInConvertKit(customerEmail, plan.tier)
  ]);

  return res.status(200).json({ received: true });
}

async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export const config = { api: { bodyParser: false } };
