import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.js';
import { createApp, ensureJahrgangCodes } from './app.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3000;
const dbFile = process.env.DB_FILE || path.join(root, 'data', 'db.json');

const db = openDb(dbFile);
await ensureJahrgangCodes(db);

const handler = createApp({
  db,
  publicDir: path.join(root, 'public'),
  secureCookies: process.env.COOKIE_SECURE === '1',
});

http.createServer(handler).listen(port, () => {
  console.log(`StayPrep läuft auf http://localhost:${port}`);
});
