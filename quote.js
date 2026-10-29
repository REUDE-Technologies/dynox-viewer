// Get a Quote: customer requirement (SRS) form.
// Sends to /api/quote (Vercel function, emails the sales team). If that endpoint is not available,
// falls back to opening the visitor's email app with the request filled in.
import qrcode from './vendor/qr/qrcode.mjs';

export const RECIPIENTS = ['cmo_ira@reude.tech', 'business@reude.tech'];

const $ = (id) => document.getElementById(id);
let lastFocus = null;

function quoteUrl() {
  const u = new URL(location.href);
  u.search = ''; u.hash = '';
  u.searchParams.set('quote', '1');
  return u.toString();
}

function drawQr(canvas, text, scale = 6, margin = 4) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const size = (n + margin * 2) * scale;
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, size, size);
  c.fillStyle = '#18222d';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) {
    if (qr.isDark(r, k)) c.fillRect((k + margin) * scale, (r + margin) * scale, scale, scale);
  }
}

function downloadQr() {
  const qr = document.createElement('canvas');
  drawQr(qr, quoteUrl(), 12, 4);
  const pad = 40, W = qr.width + pad * 2, H = qr.height + 190;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const c = out.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#e8630a'; c.fillRect(0, 0, W, 10);
  c.fillStyle = '#18222d'; c.font = '600 34px Barlow, Arial, sans-serif'; c.textAlign = 'center';
  c.fillText('DynoX thrust stands', W / 2, 62);
  c.font = '24px Barlow, Arial, sans-serif'; c.fillStyle = '#5b6875';
  c.fillText('Scan to request a quote', W / 2, 98);
  c.drawImage(qr, pad, 116);
  c.font = '20px Barlow, Arial, sans-serif';
  c.fillText('REUDE Technologies · business@reude.tech', W / 2, H - 30);
  out.toBlob((b) => saveBlob(b, 'DynoX-quote-request-QR.png'), 'image/png');
}

// Inside the claude.ai preview, page downloads go through the viewer's `downloads` capability;
// on a normal website the browser download is used.
let dlNs;
function downloadsNs() {
  if (dlNs === undefined) dlNs = window.claude?.use ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  return dlNs;
}
downloadsNs();

export async function saveBlob(blob, name) {
  const ns = await downloadsNs();
  if (ns) {
    try { await ns.save({ filename: name, data: blob }); } catch (err) { if (err?.code !== 'declined') console.warn('save failed', err); }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function collect(form) {
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) {
    if (data[k] !== undefined) data[k] = [].concat(data[k], v); else data[k] = v;
  }
  return data;
}

const LABELS = [
  ['Contact', [['name', 'Name'], ['organisation', 'Organisation'], ['designation', 'Designation'], ['email', 'Email'], ['phone', 'Phone'], ['city', 'City'], ['country', 'Country']]],
  ['Product', [['model', 'Model of interest'], ['quantity', 'Quantity'], ['application', 'Application']]],
  ['Test requirements', [['thrust', 'Maximum thrust (kgf)'], ['torque', 'Maximum torque (Nm)'], ['rpm', 'Maximum speed (RPM)'], ['voltage', 'Battery voltage (S)'], ['current', 'Maximum current (A)'], ['prop', 'Propeller diameter (inch)'], ['motor', 'Motor model or size'], ['environment', 'Test environment']]],
  ['Measurement and software', [['measure', 'Parameters to measure'], ['sampling', 'Sampling rate (Hz)'], ['interface', 'Data interface'], ['software', 'Software']]],
  ['Commercial', [['installation', 'Installation and training'], ['location', 'Delivery location'], ['date', 'Required by'], ['budget', 'Budget range'], ['notes', 'Additional requirements']]],
];

export function formatRequest(data) {
  const lines = ['DynoX quote request (SRS)', ''];
  for (const [sec, fields] of LABELS) {
    lines.push(sec.toUpperCase());
    for (const [k, label] of fields) {
      const v = data[k];
      if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
      lines.push(`${label}: ${Array.isArray(v) ? v.join(', ') : v}`);
    }
    lines.push('');
  }
  lines.push(`Sent from the DynoX 3D viewer, ${new Date().toISOString().slice(0, 10)}`);
  return lines.join('\n');
}

function setStatus(kind, text) {
  const el = $('qStatus');
  el.className = `q-status ${kind}`;
  el.textContent = text;
  el.hidden = !text;
}

async function submit(ev) {
  ev.preventDefault();
  const form = ev.target;
  if (!form.reportValidity()) return;
  const data = collect(form);
  if (data.website) return; // honeypot
  const btn = $('qSend');
  btn.disabled = true; btn.textContent = 'Sending…';
  setStatus('', '');
  try {
    const res = await fetch('api/quote', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(String(res.status));
    setStatus('ok', `Request sent to ${RECIPIENTS.join(' and ')}. The REUDE team will reply to ${data.email}.`);
    form.reset();
  } catch {
    const subject = `DynoX quote request: ${data.model || 'thrust stand'} for ${data.organisation || data.name || ''}`.trim();
    const body = formatRequest(data);
    location.href = `mailto:${RECIPIENTS.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('warn', 'Your email app should open with the request filled in. Press Send there to finish. If nothing opens, email the details to business@reude.tech.');
  } finally {
    btn.disabled = false; btn.textContent = 'Send request';
  }
}

export function openQuote(modelId) {
  const dlg = $('quote');
  lastFocus = document.activeElement;
  const sel = $('qModel');
  const map = { 'compact-5': 'RTS Compact 5 (5 kgf)', 'pro-20': 'RTS Pro 20 (20 kgf)', 'ultra-50': 'RTS Ultra 50 (50 kgf)' };
  if (modelId && map[modelId] && !sel.dataset.touched) sel.value = map[modelId];
  drawQr($('qQr'), quoteUrl(), 5, 3);
  setStatus('', '');
  dlg.hidden = false;
  document.body.classList.add('modal-open');
  setTimeout(() => $('qName').focus(), 30);
}

export function closeQuote() {
  $('quote').hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocus) lastFocus.focus();
}

// Links with a download attribute (user manual, SRS form) also go through saveBlob when needed.
document.addEventListener('click', async (ev) => {
  const a = ev.target.closest('a[download]');
  if (!a || !window.claude?.use) return;
  ev.preventDefault();
  const res = await fetch(a.href);
  saveBlob(await res.blob(), a.getAttribute('download') || a.href.split('/').pop());
}, true);

export function initQuote(getModelId) {
  $('qForm').addEventListener('submit', submit);
  $('qModel').addEventListener('change', (ev) => { ev.target.dataset.touched = '1'; });
  $('qClose').addEventListener('click', closeQuote);
  $('qCancel').addEventListener('click', closeQuote);
  $('qQrDownload').addEventListener('click', downloadQr);
  $('quote').addEventListener('click', (ev) => { if (ev.target.id === 'quote') closeQuote(); });
  window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !$('quote').hidden) { ev.stopPropagation(); closeQuote(); } }, true);
  $('bQuote').addEventListener('click', () => openQuote(getModelId()));
  if (new URLSearchParams(location.search).get('quote') === '1') openQuote(getModelId());
}
