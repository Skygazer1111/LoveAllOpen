import { defineConfig, loadEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function readLocalWaPriyan(root) {
  try {
    const envPath = path.join(root, '.env');
    if (!fs.existsSync(envPath)) return '';
    const line = fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('WA_PRIYAN='));
    if (!line) return '';
    return line.slice('WA_PRIYAN='.length).trim().replace(/^["']|["']$/g, '');
  } catch {
    return '';
  }
}

function whatsappDevRedirect() {
  return {
    name: 'whatsapp-dev-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url !== '/api/wa/priyan' && url !== '/api/wa/priyan/') {
          return next();
        }

        const env = loadEnv(server.config.mode, server.config.root, '');
        const raw =
          env.WA_PRIYAN ||
          process.env.WA_PRIYAN ||
          readLocalWaPriyan(server.config.root);
        const digits = String(raw).replace(/\D/g, '');

        if (!digits) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Set WA_PRIYAN in .env (e.g. WA_PRIYAN=916380243702), then restart npm run dev');
          return;
        }

        res.statusCode = 302;
        res.setHeader('Location', `https://wa.me/${digits}`);
        res.setHeader('Cache-Control', 'no-store');
        res.end();
      });
    }
  };
}

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public',
  plugins: [whatsappDevRedirect()]
});
