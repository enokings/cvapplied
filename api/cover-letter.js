// api/cover-letter.js
// Career+ feature: generates a tailored UK cover letter from CV + JD.

import crypto from 'crypto';

function verifyToken(token) {
  if (!token) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'cvapplied-fallback-secret';
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    // Career+ is required; Pro alone is not sufficient
    return payload.includes(':career_plus');
  } catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { token, cvText, jdText, companyName, hiringManager, tone } = req.body;

  if (!verifyToken(token)) {
    return res.status(403).json({ error: 'Career+ access required', upgrade: true });
  }
  if (!cvText || cvText.trim().length < 100) {
    return res.status(400).json({ error: 'CV text required (minimum 100 characters)' });
  }
  if (!jdText || jdText.trim().length < 50) {
    return res.status(400).json({ error: 'Job description required' });
  }

  const toneInstruction = {
    professional: 'formal, professional, and measured',
    confident:    'confident, direct, and achievement-focused',
    warm:         'personable, enthusiastic, and approachable'
  }[tone] || 'professional, confident, and clear';

  const prompt = `You are an expert UK career writer specialising in cover letters. Write a compelling, tailored UK cover letter based on the candidate's CV and the job description provided.

TONE: ${toneInstruction}

RULES:
1. Maximum 3 paragraphs plus opening/closing — under 350 words total.
2. British English throughout — no Americanisms.
3. Open with the candidate's strongest relevant credential or achievement — never "I am writing to apply for".
4. Middle paragraph(s): draw direct connections between the candidate's specific experience/achievements and the JD's key requirements. Use concrete examples and numbers from the CV.
5. Closing paragraph: express genuine interest in the specific company (use the company name if provided), confirm availability, and close confidently.
6. Do NOT fabricate experience — use only what is in the CV.
7. No generic filler phrases ("team player", "hard worker", "passionate about").
8. Format: plain text. Include a header block with candidate contact details. Use "Dear ${hiringManager || 'Hiring Manager'}," as the salutation. End with "Yours sincerely," if named, "Yours faithfully," if not.

CV:
${cvText.trim()}

JOB DESCRIPTION:
${jdText.trim()}

${companyName ? `COMPANY NAME: ${companyName}` : ''}

Return ONLY the cover letter as plain text — no preamble, no explanation, no markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'AI error' });
    }

    const data = await response.json();
    const coverLetter = data.content?.[0]?.text || '';
    if (!coverLetter.trim()) return res.status(500).json({ error: 'AI returned empty response. Please try again.' });

    return res.status(200).json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
