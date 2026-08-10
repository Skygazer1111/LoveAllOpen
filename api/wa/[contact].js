/**
 * WhatsApp contact redirect — number comes from Vercel env, not the frontend.
 * GET /api/wa/priyan  →  302 https://wa.me/<digits>
 */

const CONTACTS = {
  priyan: process.env.WA_PRIYAN
};

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const key = String(req.query.contact || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

  const raw = CONTACTS[key];
  if (!raw) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Contact not found');
    return;
  }

  const digits = String(raw).replace(/\D/g, '');
  if (!digits) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Contact unavailable');
    return;
  }

  res.statusCode = 302;
  res.setHeader('Location', `https://wa.me/${digits}`);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}
