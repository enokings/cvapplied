// api/linkedin.js
// Career+ feature: optimises LinkedIn headline, About section, and skills for UK recruiters.

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

  const { token, cvText, currentHeadline, currentAbout, targetRole, targetIndustry } = req.body;

  if (!verifyToken(token)) {
    return res.status(403).json({ error: 'Career+ access required', upgrade: true });
  }
  if (!cvText || cvText.trim().length < 100) {
    return res.status(400).json({ error: 'CV text required (minimum 100 characters)' });
  }

  const prompt = `You are a UK LinkedIn profile expert. Optimise this professional's LinkedIn profile sections for maximum visibility with UK recruiters and LinkedIn's search algorithm.

CV:
${cvText.trim()}

${currentHeadline ? `CURRENT HEADLINE: ${currentHeadline}` : ''}
${currentAbout ? `CURRENT ABOUT SECTION: ${currentAbout}` : ''}
${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
${targetIndustry ? `TARGET INDUSTRY: ${targetIndustry}` : ''}

LINKEDIN OPTIMISATION RULES:
- Headlines: max 220 characters. Structure: [Job Title] | [Key Specialisation] | [Credential or USP]. Include searchable keywords. Do NOT use generic phrases like "Seeking opportunities" or "Open to work".
- About section: max 2,600 characters. Write in first person. Open with a hook — the candidate's most compelling credential or career story. Three paragraphs: who they are + what they do, key achievements with metrics, what they're looking for and how to contact them. End with a clear call to action. British English. No buzzwords.
- Skills: Return a list of 15–20 skills the candidate should feature, in priority order. Mix technical and soft skills. Include exact terms recruiters search for in this field.

Return ONLY a valid JSON object with this exact structure — no markdown, no preamble:
{
  "headline": {
    "primary": "<recommended headline — max 220 chars>",
    "alternatives": ["<alt 1>", "<alt 2>"]
  },
  "about": "<full optimised About section — plain text with \\n for line breaks>",
  "skills": ["<skill 1>", "<skill 2>", "..."],
  "keywordGaps": ["<keyword missing from current profile that recruiters search for>"],
  "tips": [
    "<specific tip about their profile based on what's in the CV>",
    "<another tip>"
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'AI error' });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    let result;
    try {
      const cleaned = rawText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON found');
      result = JSON.parse(cleaned.slice(start, end + 1));
    } catch (e) {
      console.error('LinkedIn parse error:', e, rawText.slice(0, 300));
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('LinkedIn optimiser error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
