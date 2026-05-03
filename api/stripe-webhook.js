import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;

// ── CODE GENERATION ──
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CVAP-${segment(4)}-${segment(4)}`;
}

// ── SEND EMAIL VIA RESEND ──
async function sendAccessCodeEmail(email, code, planName) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e4e4e0;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0f1117;padding:28px 36px;">
            <span style="font-size:1.4rem;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">CV<span style="color:#1a56db;">Applied</span></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="font-size:1rem;color:#3a3d4a;margin:0 0 20px;">Hi there,</p>
            <p style="font-size:1rem;color:#3a3d4a;margin:0 0 20px;">
              Thank you for subscribing to <strong>CVApplied ${planName}</strong>. Your access code is ready below.
            </p>

            <!-- Code box -->
            <div style="background:#e8effe;border:2px solid #1a56db;border-radius:12px;padding:24px;text-align:center;margin:28px 0;">
              <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1a56db;margin:0 0 10px;">Your Access Code</p>
              <p style="font-size:2rem;font-weight:700;font-family:'Courier New',monospace;color:#0f1117;letter-spacing:0.12em;margin:0;">${code}</p>
            </div>

            <!-- Instructions -->
            <p style="font-size:0.95rem;color:#3a3d4a;margin:0 0 16px;font-weight:600;">How to activate:</p>
            <ol style="color:#3a3d4a;font-size:0.9rem;line-height:1.8;margin:0 0 24px;padding-left:20px;">
              <li>Go to <a href="https://www.cvapplied.com/analyse.html" style="color:#1a56db;">cvapplied.com/analyse.html</a></li>
              <li>Analyse your CV — after the report loads, scroll to the bottom</li>
              <li>Click <strong>"I have an access code"</strong></li>
              <li>Enter your code above to unlock unlimited Pro access</li>
            </ol>

            <p style="font-size:0.85rem;color:#7a7f8e;margin:0 0 8px;">Keep this email safe — your code is unique to you.</p>
            <p style="font-size:0.85rem;color:#7a7f8e;margin:0;">Questions? Reply to this email and we'll help.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f6fa;padding:20px 36px;border-top:1px solid #e4e4e0;">
            <p style="font-size:0.75rem;color:#7a7f8e;margin:0;">
              CVApplied · Built for UK job seekers 🇬🇧 ·
              <a href="https://www.cvapplied.com" style="color:#1a56db;">cvapplied.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'CVApplied <info@cvapplied.com>',
        to: [email],
        subject: `Your CVApplied Pro access code`,
        html
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend error');
    console.log(`Access code email sent to ${email} via Resend. ID: ${data.id}`);
  } catch (err) {
    console.error('Resend error:', err);
    // Don't throw — code is logged below as backup
  }
}

// ── MAIN HANDLER ──
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
  const amountTotal = session.amount_total;

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return res.status(200).json({ received: true });
  }

  let planName = 'Pro';
  if (amountTotal >= 8900) planName = 'Pro Annual';
  else if (amountTotal >= 1900) planName = 'Career+';

  const code = generateAccessCode();

  // Always log as backup — visible in Vercel → Functions → Logs
  console.log(`[ISSUED_CODE] email=${customerEmail} code=${code} plan=${planName} session=${session.id}`);

  // Send email via Resend
  await sendAccessCodeEmail(customerEmail, code, planName);

  return res.status(200).json({ received: true });
}

// ── BUFFER HELPER ──
async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export const config = {
  api: { bodyParser: false },
};
