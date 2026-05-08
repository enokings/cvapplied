export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Keys from environment variables — never hardcode in source
  const CK_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CK_FORM_ID = process.env.CONVERTKIT_FORM_ID;

  if (!CK_API_KEY || !CK_FORM_ID) {
    console.error('ConvertKit env vars not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { email, tag } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email required' });

    // Basic server-side email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${CK_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: CK_API_KEY,
          email,
          tags: [tag || 'cvapplied-analyser']
        })
      }
    );

    const data = await response.json();
    return res.status(200).json({ ok: true, subscription: data.subscription });

  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
