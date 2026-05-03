export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CK_API_KEY = 'AIAMEjISW_Fv22iO-4lCsA';
  const CK_FORM_ID = '9398094';

  try {
    const { email, tag } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

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
