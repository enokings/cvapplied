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
    summary: `You are an expert UK CV writer. Rewrite this professional summary for a ${jobTitle || 'professional'} to be punchy, ATS-optimised, and compelling for UK recruiters. Use British English. Keep it to 3-4 sentences. Return ONLY the rewritten summary, no preamble:\n\n${content}`,
    experience: `You are an expert UK CV writer. Rewrite these job experience bullet points for a ${jobTitle || 'professional'} using strong UK action verbs, quantified impact where possible, and British English. Each bullet should start with a past-tense action verb. Return ONLY the rewritten bullets, one per line, starting each with •:\n\n${content}`,
    skills: `You are an expert UK CV writer. Organise and improve this skills list for a ${jobTitle || 'professional'} to be ATS-optimised for UK job applications. Group related skills logically. Return ONLY the improved skills list in British English:\n\n${content}`,
    education: `You are an expert UK CV writer. Format and improve this education section for UK CV standards. Include degree classification format (e.g. 2:1), institution, and year. Use British English. Return ONLY the formatted education section:\n\n${content}`
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
