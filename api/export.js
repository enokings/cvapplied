import crypto from 'crypto';
import {
  Document, Packer, Paragraph, TextRun,
  BorderStyle, convertInchesToTwip
} from 'docx';

// ── VERIFY PRO TOKEN ──
// Checks the HMAC signature produced by verify-code.js
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
    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf) && payload.includes(':pro');
  } catch { return false; }
}

// ── PARSE CV TEXT INTO DOCX ──
function buildDocx(cvText) {
  const lines = cvText.split('\n');
  const children = [];
  let isFirstHeading = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    if (trimmed.startsWith('\u2500')) {
      children.push(new Paragraph({
        border: { bottom: { color: 'C0C4D0', style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 120, after: 120 }
      }));
      continue;
    }

    const isAllCaps = trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      !trimmed.includes('@') &&
      !trimmed.includes('|') &&
      !trimmed.match(/^\d/);

    if (isAllCaps) {
      if (isFirstHeading) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 36, color: '0F1117', font: 'Calibri' })],
          spacing: { after: 60 }
        }));
        isFirstHeading = false;
      } else {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 20, color: '1A56DB', font: 'Calibri', allCaps: true })],
          spacing: { before: 200, after: 80 }
        }));
      }
      continue;
    }

    if (trimmed.includes(' | ') && !trimmed.includes('@')) {
      const hasDates = trimmed.match(/\d{4}/) || trimmed.includes('Present');
      const parts = trimmed.split(' | ');
      const runChildren = [];
      parts.forEach((part, i) => {
        runChildren.push(new TextRun({ text: part, bold: i === 0 && hasDates, size: 21, color: i === 0 ? '0F1117' : '3A3D4A', font: 'Calibri' }));
        if (i < parts.length - 1) runChildren.push(new TextRun({ text: ' | ', size: 21, color: '7A7F8E', font: 'Calibri' }));
      });
      children.push(new Paragraph({ children: runChildren, spacing: { before: hasDates ? 120 : 40, after: 60 } }));
      continue;
    }

    if (trimmed.includes('@') || trimmed.includes('linkedin.com')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, size: 20, color: '3A3D4A', font: 'Calibri' })],
        spacing: { after: 80 }
      }));
      continue;
    }

    if (trimmed.startsWith('\u2022') || trimmed.startsWith('- ')) {
      const text = trimmed.replace(/^[\u2022\-]\s*/, '');
      children.push(new Paragraph({
        children: [new TextRun({ text: '\u2022 ' + text, size: 21, color: '2A2D3A', font: 'Calibri' })],
        indent: { left: convertInchesToTwip(0.25) },
        spacing: { after: 60 }
      }));
      continue;
    }

    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed, size: 21, color: '2A2D3A', font: 'Calibri' })],
      spacing: { after: 60 }
    }));
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.9),
            right: convertInchesToTwip(0.9)
          }
        }
      },
      children
    }]
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cvText, token, name } = req.body;

  if (!isProToken(token)) {
    return res.status(403).json({ error: 'Pro access required', upgrade: true });
  }
  if (!cvText || cvText.trim().length < 50) {
    return res.status(400).json({ error: 'No CV content provided' });
  }

  // Sanitise filename — strip anything that isn't alphanumeric, space, or hyphen
  const safeName = (name || 'cv')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'cv';
  const filename = `${safeName}-cvapplied.docx`;

  try {
    const doc = buildDocx(cvText);
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('DOCX error:', err);
    return res.status(500).json({ error: 'Failed to generate DOCX: ' + err.message });
  }
}
