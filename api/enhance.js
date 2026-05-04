export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { section, content, jobTitle } = req.body;
  if (!content || content.trim().length < 10) return res.status(400).json({ error: 'Content too short' });

  const prompts = {
    summary: `You are an expert UK CV writer. Rewrite this professional summary for a ${jobTitle || 'professional'} to be punchy, ATS-optimised, and compelling for UK recruiters. Use British English. Keep it to 3-4 sentences. Return ONLY the rewritten summary as plain text — no bullet points, no headers, no markdown formatting, no preamble:

${content}`,

    experience: `You are an expert UK CV writer. Rewrite these job experience bullet points for a ${jobTitle || 'professional'} using strong UK action verbs, quantified impact where possible, and British English. Return ONLY the bullet points as plain text. Start each bullet with • on a new line. No headers, no markdown, no preamble:

${content}`,

    skills: `You are an expert UK CV writer. Organise and improve this skills list for a ${jobTitle || 'professional'} for UK CV standards. Return ONLY a clean, comma-separated or line-by-line list of skills grouped into short labelled sections like "Technical: SQL, Python, Power BI" and "Soft Skills: Stakeholder Management, Communication". No markdown bold, no asterisks, no preamble — plain text only:

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
