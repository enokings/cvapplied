import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { prompt, fileData, fileType } = req.body;
    let finalPrompt = prompt;

    // If a file was sent as base64, extract text server-side
    if (fileData && fileType) {
      const buffer = Buffer.from(fileData, 'base64');
      let extractedText = '';

      if (fileType === 'pdf') {
        try {
          const parsed = await pdfParse(buffer);
          extractedText = parsed.text;
        } catch (e) {
          return res.status(400).json({ error: 'Could not extract text from PDF. Please use the Paste Text tab instead.' });
        }
      } else {
        // DOC/DOCX/TXT — decode as UTF-8 text
        extractedText = buffer.toString('utf-8')
          .replace(/[^\x20-\x7E\n\r\t£€]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      if (!extractedText || extractedText.length < 100) {
        return res.status(400).json({ error: 'Could not extract enough text from this file. Please use the Paste Text tab instead.' });
      }

      // Inject extracted text into the prompt
      finalPrompt = prompt.replace('__CV_TEXT__', extractedText);
    }

    if (!finalPrompt || finalPrompt.length < 50) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: finalPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
