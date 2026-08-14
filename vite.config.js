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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function tournamentDevStore() {
  return {
    name: 'tournament-dev-store',
    configureServer(server) {
      const root = server.config.root;
      const filePath = path.join(root, 'data', 'tournament.json');
      const publicPath = path.join(root, 'public', 'live-board.json');

      const writeBoard = (data) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.mkdirSync(path.dirname(publicPath), { recursive: true });
        const json = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, json);
        fs.writeFileSync(publicPath, json);
      };

      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url !== '/api/tournament' && url !== '/api/tournament/') {
          return next();
        }

        const send = (code, body) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };

        if (req.method === 'GET' || req.method === 'HEAD') {
          try {
            const source = fs.existsSync(filePath) ? filePath : publicPath;
            if (!fs.existsSync(source)) return send(200, { data: null, configured: true });
            const data = JSON.parse(fs.readFileSync(source, 'utf8'));
            return send(200, { data, configured: true });
          } catch {
            return send(200, { data: null, configured: true });
          }
        }

        if (req.method === 'PUT' || req.method === 'POST') {
          try {
            const payload = await readJsonBody(req);
            const data = payload.data;
            if (!data?.categories || !data?.settings) {
              return send(400, { error: 'Invalid tournament data' });
            }
            writeBoard(data);
            return send(200, { ok: true, configured: true });
          } catch {
            return send(400, { error: 'Invalid JSON' });
          }
        }

        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD, PUT, POST');
        res.end('Method Not Allowed');
      });
    }
  };
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
    host: true,
    open: true
  },
  publicDir: 'public',
  plugins: [tournamentDevStore(), whatsappDevRedirect()]
});
