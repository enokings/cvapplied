// api/interview-prep.js
// Career+ feature: generates tailored interview questions and answer guidance
// based on the candidate's actual CV and a target JD.

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

  const { token, cvText, jdText, interviewType, seniorityLevel } = req.body;

  if (!verifyToken(token)) {
    return res.status(403).json({ error: 'Career+ access required', upgrade: true });
  }
  if (!cvText || cvText.trim().length < 100) {
    return res.status(400).json({ error: 'CV text required' });
  }

  const typeContext = {
    competency:   'competency-based (STAR format)',
    technical:    'technical and role-specific',
    senior:       'senior/leadership and strategic',
    general:      'general and behavioural'
  }[interviewType] || 'mixed (competency, technical, and behavioural)';

  const prompt = `You are a senior UK recruitment consultant and interview coach. Generate a personalised interview preparation guide for this candidate based on their CV${jdText ? ' and the target job description' : ''}.

CV:
${cvText.trim()}

${jdText ? `JOB DESCRIPTION:\n${jdText.trim()}` : ''}
INTERVIEW TYPE: ${typeContext}
${seniorityLevel ? `SENIORITY LEVEL: ${seniorityLevel}` : ''}

REQUIREMENTS:
- Generate exactly 10 interview questions
- Questions must be specific to this candidate's background and the role — not generic
- For each question, provide:
  1. WHY they will ask it (what the interviewer is really testing)
  2. HOW to answer it using this candidate's actual experience (reference specific roles, achievements, or skills from their CV)
  3. A WATCH OUT — the common mistake candidates make on this question
- Include a mix of: competency/STAR questions, role-specific technical questions, and culture/motivation questions
- British English throughout
- For competency questions, suggest which specific example from the CV would make the strongest answer

Return ONLY a valid JSON object — no markdown, no preamble:
{
  "roleTitle": "<inferred target role title>",
  "keyThemes": ["<interview theme 1>", "<interview theme 2>", "<theme 3>"],
  "questions": [
    {
      "question": "<the interview question>",
      "type": "<competency|technical|motivation|culture>",
      "whyAsked": "<what the interviewer is testing>",
      "howToAnswer": "<specific guidance using this candidate's actual experience>",
      "suggestedExample": "<specific role/achievement from CV to use>",
      "watchOut": "<common mistake to avoid>"
    }
  ],
  "prepTips": [
    "<specific preparation tip based on this candidate's profile>",
    "<another specific tip>"
  ],
  "questionsToAsk": [
    "<strong question for the candidate to ask the interviewer, relevant to this role>",
    "<another good question to ask>"
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
        max_tokens: 3500,
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
      console.error('Interview prep parse error:', e, rawText.slice(0, 300));
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Interview prep error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
