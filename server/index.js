import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.js';
import { createApp, ensureJahrgangCodes } from './app.js';
import { mailerFromEnv } from './mail.js';

const env = process.env;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(env.PORT) || 3000;
const dbFile = env.DB_FILE || path.join(root, 'data', 'db.json');

// Öffentliche Adresse: selbst gesetzt oder vom Hoster (Render / Railway) übernommen.
const appUrl = env.APP_URL
  || env.RENDER_EXTERNAL_URL
  || (env.RAILWAY_PUBLIC_DOMAIN && `https://${env.RAILWAY_PUBLIC_DOMAIN}`)
  || `http://localhost:${port}`;
const behindProxy = env.TRUST_PROXY === '1' || Boolean(env.RENDER || env.RAILWAY_ENVIRONMENT);

const db = openDb(dbFile);
await ensureJahrgangCodes(db);

let mailer;
try {
  mailer = mailerFromEnv(env);
} catch (err) {
  // Unvollständige Mail-Einstellungen sollen die App nicht lahmlegen.
  console.error(`Mailversand nicht eingerichtet: ${err.message}`);
  mailer = mailerFromEnv({});
}
console.log(mailer.kind
  ? `E-Mails werden verschickt über ${mailer.kind}.`
  : 'Kein Mailversand eingerichtet (BREVO_API_KEY oder SMTP_HOST fehlt): E-Mails erscheinen nur hier in der Konsole.');
console.log(`Daten werden gespeichert in ${dbFile}`);

const handler = createApp({
  db,
  publicDir: path.join(root, 'public'),
  secureCookies: env.COOKIE_SECURE === '1' || appUrl.startsWith('https://'),
  trustProxy: behindProxy,
  appUrl,
  sendMail: mailer.sendMail,
});

http.createServer(handler).listen(port, () => {
  console.log(`StayPrep läuft auf ${appUrl} (Port ${port})`);
});
