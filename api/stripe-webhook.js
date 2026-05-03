import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const CK_API_KEY = 'AIAMEjISW_Fv22iO-4lCsA';
const CK_FORM_ID = '9398094';

// ── CODE GENERATION ──
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars (0,O,1,I)
  const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CVAP-${segment(4)}-${segment(4)}`;
}

// ── SEND CODE VIA CONVERTKIT ──
async function sendAccessCodeEmail(email, code, planName) {
  try {
    // Subscribe to ConvertKit with the access code as a custom field
    await fetch(`https://api.convertkit.com/v3/forms/${CK_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: CK_API_KEY,
        email,
        tags: ['cvapplied-pro'],
        fields: {
          access_code: code,
          plan: planName
        }
      })
    });
    console.log(`Access code sent to ${email}: ${code}`);
  } catch (err) {
    console.error('ConvertKit error:', err);
    // Don't throw — log and continue. Code is also logged above for manual recovery.
  }
}

// ── STORE CODE SERVER-SIDE ──
// Since Vercel is stateless, we store issued codes in an environment variable
// For production scale, swap this for a Vercel KV or Supabase table.
// For now, codes are logged so you can manually add them to verify-code.js if needed.
async function logIssuedCode(email, code) {
  // Log to Vercel function logs — visible in Vercel dashboard → Functions → Logs
  console.log(`[ISSUED_CODE] email=${email} code=${code} time=${new Date().toISOString()}`);
}

// ── MAIN HANDLER ──
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get raw body for signature verification
  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Only process successful checkouts
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  const amountTotal = session.amount_total;
  const currency = session.currency;

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return res.status(200).json({ received: true });
  }

  // Determine plan name from amount
  let planName = 'Pro';
  if (amountTotal >= 8900) planName = 'Pro Annual';
  else if (amountTotal >= 1900) planName = 'Career+';

  // Generate unique access code
  const code = generateAccessCode();

  // Log and email the code
  await logIssuedCode(customerEmail, code);
  await sendAccessCodeEmail(customerEmail, code, planName);

  console.log(`Payment processed: ${customerEmail} → ${planName} → ${code}`);
  return res.status(200).json({ received: true });
}

// ── BUFFER HELPER ──
// Vercel requires raw body for Stripe signature verification
async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ── VERCEL CONFIG ──
// Must disable body parsing so we can read raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
