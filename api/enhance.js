export default async function handler(req, res) {
  // CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { section, content, jobTitle } = req.body;
  if (!content || content.trim().length < 10) return res.status(400).json({ error: 'Content too short' });

  const validSections = ['summary', 'experience', 'skills', 'competencies', 'education'];
  if (section && !validSections.includes(section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }

  // Simple IP-based rate limiting (in-memory; resets on cold start — acceptable for low-traffic MVP)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!enhance_rateLimiter.check(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const prompts = {
    summary: `You are an expert UK CV writer. Rewrite this professional summary for a ${jobTitle || 'professional'} to be punchy, ATS-optimised, and compelling for UK recruiters. Use British English. Keep it to 3-4 sentences. Return ONLY the rewritten summary as plain text — no bullet points, no headers, no markdown formatting, no preamble:

${content}`,

    experience: `You are an expert UK CV writer. Rewrite these job experience bullet points for a ${jobTitle || 'professional'} using strong UK action verbs, quantified impact where possible, and British English. Return ONLY the bullet points as plain text. Start each bullet with • on a new line. No headers, no markdown, no preamble:

${content}`,

    skills: `You are an expert UK CV writer. Organise and improve this skills list for a ${jobTitle || 'professional'} for UK CV standards. Return ONLY a clean, comma-separated or line-by-line list of skills grouped into short labelled sections like "Technical: SQL, Python, Power BI" and "Soft Skills: Stakeholder Management, Communication". No markdown bold, no asterisks, no preamble — plain text only:

${content}`,

    competencies: `You are an expert UK CV writer. Consolidate and improve this list of skills and competencies for a ${jobTitle || 'professional'} into a single CORE COMPETENCIES line for a UK CV. Format: pipe-separated keywords and short phrases on a single line, ordered by relevance — most important first. Include both technical skills and professional competencies. Maximum 18 items. No markdown, no bullet points, no labels, no preamble — return ONLY the pipe-separated line of competencies:

${content}`,

    education: `You are an expert UK CV writer. Format and improve this education section for UK CV standards. Use format: Degree (Classification) | Institution | Year. One entry per line. Return ONLY the formatted education as plain text — no markdown, no headers, no preamble:

${content}`
  };

  const prompt = prompts[section] || prompts.experience;

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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const enhanced = data.content?.[0]?.text || '';
    return res.status(200).json({ enhanced });

  } catch (err) {
    console.error('Enhance error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Simple in-memory rate limiter: 10 requests per IP per 60 seconds
const enhance_rateLimiter = (() => {
  const map = new Map();
  const LIMIT = 10;
  const WINDOW = 60 * 1000;
  return {
    check(ip) {
      const now = Date.now();
      const rec = map.get(ip) || { count: 0, reset: now + WINDOW };
      if (now > rec.reset) { map.set(ip, { count: 1, reset: now + WINDOW }); return true; }
      if (rec.count >= LIMIT) return false;
      rec.count++;
      map.set(ip, rec);
      return true;
    }
  };
})();
