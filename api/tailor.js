// api/tailor.js
// Pro-gated CV tailoring endpoint.
// Accepts CV text + JD text (or base64 files), rewrites the CV to match the JD.

import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import crypto from 'crypto';

// ── VERIFY PRO TOKEN (same logic as export.js) ──
function isProToken(token) {
  if (!token) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'cvapplied-fallback-secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf) && payload.includes(':pro');
  } catch { return false; }
}

// ── EXTRACT TEXT FROM FILE BUFFER ──
async function extractText(fileData, fileType) {
  const buffer = Buffer.from(fileData, 'base64');
  if (fileType === 'pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  } else if (fileType === 'docx' || fileType === 'doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    return buffer.toString('utf-8');
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { token, cvText, cvFileData, cvFileType, jdText, jdFileData, jdFileType } = req.body;

  if (!isProToken(token)) {
    return res.status(403).json({ error: 'Pro access required', upgrade: true });
  }

  // Resolve CV text
  let finalCvText = cvText || '';
  if (!finalCvText && cvFileData && cvFileType) {
    try {
      finalCvText = await extractText(cvFileData, cvFileType);
    } catch (e) {
      return res.status(400).json({ error: 'Could not extract text from CV file. Please use Paste Text instead.' });
    }
  }
  finalCvText = finalCvText.trim();
  if (finalCvText.length < 100) {
    return res.status(400).json({ error: 'CV text too short. Please provide your full CV.' });
  }

  // Resolve JD text
  let finalJdText = jdText || '';
  if (!finalJdText && jdFileData && jdFileType) {
    try {
      finalJdText = await extractText(jdFileData, jdFileType);
    } catch (e) {
      return res.status(400).json({ error: 'Could not extract text from JD file. Please use Paste Text instead.' });
    }
  }
  finalJdText = finalJdText.trim();
  if (finalJdText.length < 50) {
    return res.status(400).json({ error: 'Job description too short. Please provide the full job description.' });
  }

  const prompt = `You are an expert UK CV writer and career consultant. Your task is to tailor the candidate's CV to match a specific job description as closely as possible, without fabricating experience or qualifications.

RULES:
1. Preserve all facts — do not invent or exaggerate any experience, qualification, or achievement.
2. Reorder sections and bullet points to front-load the most JD-relevant experience.
3. Inject exact keywords and phrases from the JD naturally into existing bullet points.
4. Rewrite weak or generic bullet points using strong UK action verbs and quantified impact where the CV already implies metrics.
5. Ensure the Profile Summary directly addresses the JD's key requirements.
6. Remove or condense bullets that are completely irrelevant to this role.
7. Keep British English throughout — no Americanised spelling.
8. Maintain the same CV structure and formatting conventions as the original (same use of separators, bullet style, ALL CAPS headers, etc.).
9. Keep total length similar to original — do not pad (otherwise reduce bullet points for earliest roles to keep to maximum 2 pages).

OUTPUT FORMAT:
Return a JSON object with exactly this structure:
{
  "tailoredCv": "<the full tailored CV text, preserving original formatting with \\n for line breaks>",
  "changes": [
    {"type": "keyword", "description": "<what keyword was added and where>"},
    {"type": "reorder", "description": "<what was moved and why>"},
    {"type": "rewrite", "description": "<what bullet was rewritten and how>"},
    {"type": "summary", "description": "<how the profile summary was updated>"}
  ]
}

Return ONLY valid JSON — no markdown, no backticks, no preamble.

ORIGINAL CV:
${finalCvText}

JOB DESCRIPTION:
${finalJdText}`;

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
        max_tokens: 4000,
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
      let cleaned = rawText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON found');
      result = JSON.parse(cleaned.slice(start, end + 1));
    } catch (e) {
      console.error('Tailor parse error:', e, rawText.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    if (!result.tailoredCv) {
      return res.status(500).json({ error: 'AI did not return a tailored CV. Please try again.' });
    }

    return res.status(200).json({
      tailoredCv: result.tailoredCv,
      changes: result.changes || [],
      originalCv: finalCvText
    });

  } catch (err) {
    console.error('Tailor error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
