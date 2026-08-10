/**
 * WhatsApp redirect for Priyan.
 * GET /api/wa/priyan → 302 https://wa.me/<digits from WA_PRIYAN>
 */

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const digits = String(process.env.WA_PRIYAN || '').replace(/\D/g, '');

  if (!digits) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('WhatsApp contact is not configured. Set WA_PRIYAN in Vercel environment variables.');
    return;
  }

  res.statusCode = 302;
  res.setHeader('Location', `https://wa.me/${digits}`);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}
