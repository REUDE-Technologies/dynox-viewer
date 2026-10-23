// Vercel serverless function: emails a DynoX quote request (SRS form) to the REUDE sales team.
// Configure these Environment Variables in Vercel (Project > Settings > Environment Variables):
//   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS, MAIL_FROM (e.g. "DynoX Viewer <noreply@reude.tech>")
import nodemailer from 'nodemailer';

const TO = ['cmo_ira@reude.tech', 'business@reude.tech'];
const REQUIRED = ['name', 'organisation', 'email', 'phone', 'model'];
const SECTIONS = [
  ['Contact', [['name', 'Name'], ['organisation', 'Organisation'], ['designation', 'Designation'], ['email', 'Email'], ['phone', 'Phone'], ['city', 'City'], ['country', 'Country']]],
  ['Product', [['model', 'Model of interest'], ['quantity', 'Quantity'], ['application', 'Application']]],
  ['Test requirements', [['thrust', 'Maximum thrust (kgf)'], ['torque', 'Maximum torque (Nm)'], ['rpm', 'Maximum speed (RPM)'], ['voltage', 'Battery voltage (S)'], ['current', 'Maximum current (A)'], ['prop', 'Propeller diameter (inch)'], ['motor', 'Motor model or size'], ['environment', 'Test environment']]],
  ['Measurement and software', [['measure', 'Parameters to measure'], ['sampling', 'Sampling rate (Hz)'], ['interface', 'Data interface'], ['software', 'Software']]],
  ['Commercial', [['installation', 'Installation and training'], ['location', 'Delivery location'], ['date', 'Required by'], ['budget', 'Budget range'], ['notes', 'Additional requirements']]],
];

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const val = (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, 2000);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST' }); }
  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (d.website) return res.status(200).json({ ok: true }); // honeypot
  const missing = REQUIRED.filter((k) => !String(d[k] || '').trim());
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return res.status(400).json({ error: 'Invalid email' });
  if (!process.env.SMTP_HOST) return res.status(503).json({ error: 'Email is not configured' });

  let text = 'DynoX quote request (SRS)\n\n';
  let html = '<div style="font-family:Arial,sans-serif;color:#18222d"><h2 style="color:#e8630a;margin:0 0 12px">DynoX quote request</h2>';
  for (const [sec, fields] of SECTIONS) {
    const rows = fields.filter(([k]) => val(d[k]).trim());
    if (!rows.length) continue;
    text += `${sec.toUpperCase()}\n` + rows.map(([k, l]) => `${l}: ${val(d[k])}`).join('\n') + '\n\n';
    html += `<h3 style="color:#1f5c99;margin:16px 0 6px">${esc(sec)}</h3><table cellpadding="6" style="border-collapse:collapse;font-size:14px">`
      + rows.map(([k, l]) => `<tr><td style="color:#5b6875;border-bottom:1px solid #e3e7eb">${esc(l)}</td><td style="border-bottom:1px solid #e3e7eb">${esc(val(d[k])).replace(/\n/g, '<br>')}</td></tr>`).join('')
      + '</table>';
  }
  html += '</div>';

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const subject = `DynoX quote request: ${val(d.model)} for ${val(d.organisation)}`;
  try {
    await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: TO, replyTo: d.email, subject, text, html });
    if (d.copy) {
      await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: d.email, subject: `Copy of your ${subject}`, text, html });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('quote mail failed', err);
    return res.status(502).json({ error: 'Could not send email' });
  }
}
