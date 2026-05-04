import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { fileData, fileType } = req.body;
  if (!fileData || !fileType) return res.status(400).json({ error: 'Missing fileData or fileType' });

  try {
    const buffer = Buffer.from(fileData, 'base64');
    let text = '';

    if (fileType === 'pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (fileType === 'docx' || fileType === 'doc') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // TXT — decode as UTF-8
      text = buffer.toString('utf-8');
    }

    text = text.replace(/[^\x20-\x7E\n\r\t£€°]/g, ' ').replace(/\s{3,}/g, '\n').trim();

    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from this file. Please use the Paste Text tab instead.' });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Extract error:', err);
    return res.status(500).json({ error: 'Extraction failed: ' + err.message });
  }
}
