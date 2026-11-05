import { defineConfig } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Plugin so de desenvolvimento: recebe um data URL do canvas em POST /__snap e
 * grava o arquivo em .snap/. Serve para conferir o render sem depender de
 * captura de tela do navegador.
 */
function capturaDeTela() {
  return {
    name: 'captura-de-tela-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__snap', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
        let corpo = '';
        req.on('data', (c) => { corpo += c; });
        req.on('end', () => {
          try {
            const nome = (new URL(req.url, 'http://x').searchParams.get('nome') || 'frame') + '.jpg';
            const base64 = corpo.replace(/^data:image\/\w+;base64,/, '');
            const dir = resolve(process.cwd(), '.snap');
            mkdirSync(dir, { recursive: true });
            writeFileSync(resolve(dir, nome), Buffer.from(base64, 'base64'));
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, arquivo: `.snap/${nome}`, bytes: base64.length }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, erro: String(e) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [capturaDeTela()],
  server: { port: 5180, open: false },
  build: { target: 'esnext', chunkSizeWarningLimit: 2000 },
});
