/**
 * Shared tournament board.
 * GET  /api/tournament → { data }
 * PUT  /api/tournament → save published fixtures (admin)
 *
 * Production storage: Vercel KV / Upstash Redis
 *   KV_REST_API_URL + KV_REST_API_TOKEN
 *   or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * Fallback read: public/live-board.json (from last local publish + deploy)
 * Local dev: Vite middleware writes data/tournament.json + public/live-board.json
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const KV_KEY = 'loveall_tournament';

function readAdminKey(req) {
  return String(req.headers['x-admin-key'] || '').trim();
}

function isAuthorized(req) {
  const key = readAdminKey(req);
  const secret = String(process.env.ADMIN_SYNC_SECRET || process.env.ADMIN_PASSWORD || 'loveall2026');
  return key && key === secret;
}

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return {
    url: url.replace(/\/$/, ''),
    token,
    configured: Boolean(url && token)
  };
}

async function kvGet() {
  const { url, token, configured } = kvConfig();
  if (!configured) return null;
  const res = await fetch(`${url}/get/${KV_KEY}`, {
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
  const { url, token, configured } = kvConfig();
  if (!configured) return false;
  const res = await fetch(`${url}/set/${KV_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.ok;
}

function readBundledBoard() {
  const candidates = [
    join(process.cwd(), 'public', 'live-board.json'),
    join(process.cwd(), 'live-board.json'),
    join(process.cwd(), 'data', 'tournament.json'),
    join(process.cwd(), 'dist', 'live-board.json')
  ];
  for (const filePath of candidates) {
    try {
      if (!existsSync(filePath)) continue;
      const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
      if (parsed?.categories && parsed?.settings) return parsed;
      if (parsed?.data?.categories && parsed?.data?.settings) return parsed.data;
    } catch {
      // try next
    }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { configured } = kvConfig();

  if (req.method === 'GET' || req.method === 'HEAD') {
    const data = (await kvGet()) || readBundledBoard();
    if (!data) {
      res.statusCode = 200;
      res.end(JSON.stringify({ data: null, configured }));
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

    if (!configured) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: 'Live board is not connected. Free: create Redis at console.upstash.com, add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars, then redeploy.'
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
    res.end(JSON.stringify({ ok: true, configured: true }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, HEAD, PUT, POST');
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
