/**
 * Shared tournament board.
 * GET  /api/tournament → { data }
 * PUT  /api/tournament → save published fixtures (admin)
 *
 * Production storage: Vercel KV (KV_REST_API_URL + KV_REST_API_TOKEN)
 * Local dev: Vite middleware writes data/tournament.json
 */

const KV_KEY = 'loveall_tournament';

function readAdminKey(req) {
  return String(req.headers['x-admin-key'] || '').trim();
}

function isAuthorized(req) {
  const key = readAdminKey(req);
  const secret = String(process.env.ADMIN_SYNC_SECRET || process.env.ADMIN_PASSWORD || 'loveall2026');
  return key && key === secret;
}

async function kvGet() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url.replace(/\/$/, '')}/get/${KV_KEY}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const body = await res.json();
  let result = body?.result ?? null;
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch {
      return null;
    }
  }
  return result;
}

async function kvSet(data) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;
  const res = await fetch(`${url.replace(/\/$/, '')}/set/${KV_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.ok;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' || req.method === 'HEAD') {
    const data = await kvGet();
    if (!data) {
      res.statusCode = 200;
      res.end(JSON.stringify({ data: null, configured: Boolean(process.env.KV_REST_API_URL) }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ data, configured: true }));
    return;
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    if (!isAuthorized(req)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const data = payload.data;
    if (!data?.categories || !data?.settings) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid tournament data' }));
      return;
    }

    if (!process.env.KV_REST_API_URL) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: 'Live board is not configured. Add a Vercel KV store, then set KV_REST_API_URL and KV_REST_API_TOKEN.'
      }));
      return;
    }

    const ok = await kvSet(data);
    if (!ok) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Could not save live board' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, HEAD, PUT, POST');
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
