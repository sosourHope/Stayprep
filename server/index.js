import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.js';
import { createApp, ensureJahrgangCodes } from './app.js';
import { createSmtpMailer, createConsoleMailer } from './mail.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3000;
const dbFile = process.env.DB_FILE || path.join(root, 'data', 'db.json');

const db = openDb(dbFile);
await ensureJahrgangCodes(db);

const env = process.env;
const sendMail = env.SMTP_HOST
  ? createSmtpMailer({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 465,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.MAIL_FROM || env.SMTP_USER,
  })
  : createConsoleMailer();
if (!env.SMTP_HOST) console.log('Kein SMTP_HOST gesetzt: E-Mails (z. B. „Passwort vergessen“) werden nur in der Konsole ausgegeben.');

const handler = createApp({
  db,
  publicDir: path.join(root, 'public'),
  secureCookies: env.COOKIE_SECURE === '1',
  appUrl: env.APP_URL || `http://localhost:${port}`,
  sendMail,
});

http.createServer(handler).listen(port, () => {
  console.log(`StayPrep läuft auf http://localhost:${port}`);
});
