// Public Supabase config for shared design uploads.
// anon key is safe in the browser when RLS policies allow only intended actions.
export const SUPABASE_URL = 'https://tsexhyzgwvyujupqlfhh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXhoeXpnd3Z5dWp1cHFsZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzIzNTYsImV4cCI6MjEwNjk0ODM1Nn0.FasENR0xDzGtJHA3MIF1QbeG9j08QphYAgaAqY7uOBw';

const BUCKET = 'designs';

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

export function publicFileUrl(filePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
}

export async function fetchDesign(id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/designs?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: headers({ Accept: 'application/json' }) },
  );
  if (!res.ok) throw new Error(`Could not load design (${res.status})`);
  const rows = await res.json();
  if (!rows.length) throw new Error('Design not found');
  return rows[0];
}

export async function renameDesign(id, title) {
  const clean = String(title || '').trim().slice(0, 120) || 'Untitled design';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/designs?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: headers({
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify({ title: clean, updated_at: new Date().toISOString() }),
    },
  );
  if (!res.ok) throw new Error(`Rename failed (${res.status})`);
  const rows = await res.json();
  return rows[0];
}

export async function uploadDesign(file, title, onProgress) {
  if (!file) throw new Error('Choose a .glb file first');
  const name = String(file.name || '').toLowerCase();
  if (!name.endsWith('.glb')) throw new Error('Only .glb files are supported for now');
  if (file.size > 100 * 1024 * 1024) throw new Error('File must be under 100 MB');

  const id = crypto.randomUUID();
  const filePath = `${id}.glb`;
  const cleanTitle = String(title || file.name.replace(/\.glb$/i, '') || 'Untitled design')
    .trim()
    .slice(0, 120);

  if (onProgress) onProgress(0.15, 'Uploading model');
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
    {
      method: 'POST',
      headers: headers({
        'Content-Type': 'model/gltf-binary',
        'x-upsert': 'false',
      }),
      body: file,
    },
  );
  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => '');
    throw new Error(`Upload failed (${uploadRes.status})${detail ? `: ${detail}` : ''}`);
  }

  if (onProgress) onProgress(0.75, 'Saving design');
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/designs`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ id, title: cleanTitle, file_path: filePath }),
  });
  if (!insertRes.ok) {
    const detail = await insertRes.text().catch(() => '');
    throw new Error(`Could not save design (${insertRes.status})${detail ? `: ${detail}` : ''}`);
  }
  const rows = await insertRes.json();
  if (onProgress) onProgress(1, 'Ready');
  return rows[0];
}

export function shareUrl(id) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('m', id);
  return url.toString();
}
