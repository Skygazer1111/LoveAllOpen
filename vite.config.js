import { defineConfig, loadEnv } from 'vite';

function whatsappDevRedirect() {
  return {
    name: 'whatsapp-dev-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/api\/wa\/([a-z0-9_-]+)\/?(?:\?.*)?$/i);
        if (!match) return next();

        const env = loadEnv(server.config.mode, process.cwd(), '');
        const map = {
          priyan: env.WA_PRIYAN
        };
        const key = match[1].toLowerCase();
        const digits = String(map[key] || '').replace(/\D/g, '');

        if (!digits) {
          res.statusCode = key in map ? 503 : 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(key in map ? 'Set WA_PRIYAN in .env for local WhatsApp redirect' : 'Contact not found');
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

export default defineConfig(({ mode }) => {
  // Load .env into process for clarity during config
  loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      open: true
    },
    publicDir: 'public',
    plugins: [whatsappDevRedirect()]
  };
});
