import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../server/db.js';
import { createApp, ensureJahrgangCodes } from '../server/app.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let server;
let base;

before(async () => {
  const db = openDb(null);
  await ensureJahrgangCodes(db, { JAHRGANG_CODE_11: 'code-elf', JAHRGANG_CODE_12: 'code-zwoelf', JAHRGANG_CODE_13: 'code-dreizehn' }, () => {});
  const handler = createApp({ db, publicDir: path.join(root, 'public'), rateLimit: { max: 1000, windowMs: 60000 } });
  server = http.createServer(handler);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

/** Minimaler Client mit eigenem Cookie-Speicher. */
function client() {
  const jar = new Map();
  return async (p, { method = 'GET', body, contentType = 'application/json' } = {}) => {
    const headers = { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') };
    if (body !== undefined) headers['content-type'] = contentType;
    const res = await fetch(base + p, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const [k, v] = pair.split('=');
      if (v) jar.set(k, v);
      else jar.delete(k);
    }
    return { status: res.status, data: await res.json().catch(() => null) };
  };
}

test('Registrierung, Login und private Noten', async () => {
  const anna = client();
  let r = await anna('/api/register', { method: 'POST', body: { email: 'Anna@Example.de', password: 'geheim123' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.email, 'anna@example.de');

  r = await anna('/api/register', { method: 'POST', body: { email: 'anna@example.de', password: 'geheim123' } });
  assert.equal(r.status, 409);

  r = await anna('/api/grades', { method: 'POST', body: { klasse: 12, fach: 'Mathematik', art: 'klausur', wert: 13 } });
  assert.equal(r.status, 200);
  assert.equal(r.data.gewicht, 2);

  r = await anna('/api/grades', { method: 'POST', body: { klasse: 12, fach: 'Mathematik', art: 'test', wert: 16 } });
  assert.equal(r.status, 400, 'mehr als 15 Punkte ist ungültig');
  r = await anna('/api/grades', { method: 'POST', body: { klasse: 11, fach: 'Deutsch', art: 'muendlich', wert: 2.25 } });
  assert.equal(r.status, 200);

  // Andere Person sieht Annas Noten nicht
  const ben = client();
  r = await ben('/api/grades');
  assert.equal(r.status, 401);
  await ben('/api/register', { method: 'POST', body: { email: 'ben@example.de', password: 'passwort99' } });
  r = await ben('/api/grades');
  assert.equal(r.data.grades.length, 0);

  // Logout + Login
  await anna('/api/logout', { method: 'POST', body: {} });
  assert.equal((await anna('/api/grades')).status, 401);
  r = await anna('/api/login', { method: 'POST', body: { email: 'anna@example.de', password: 'falsch!!' } });
  assert.equal(r.status, 401);
  r = await anna('/api/login', { method: 'POST', body: { email: 'anna@example.de', password: 'geheim123' } });
  assert.equal(r.status, 200);
  r = await anna('/api/grades');
  assert.equal(r.data.grades.length, 2);

  // Ben kann Annas Note nicht löschen
  const id = r.data.grades[0].id;
  assert.equal((await ben(`/api/grades/${id}`, { method: 'DELETE' })).status, 404);
  assert.equal((await anna(`/api/grades/${id}`, { method: 'DELETE' })).status, 200);
});

test('POST ohne JSON wird abgelehnt (CSRF-Schutz)', async () => {
  const c = client();
  const r = await c('/api/login', { method: 'POST', body: {}, contentType: 'text/plain' });
  assert.equal(r.status, 415);
});

test('Jahrgangsbereich: Zugang, Hausaufgaben und Trennung der Jahrgänge', async () => {
  const lea = client();
  let r = await lea('/api/homework');
  assert.equal(r.status, 401);

  r = await lea('/api/jahrgang/login', { method: 'POST', body: { klasse: 12, name: 'Lea', code: 'falsch' } });
  assert.equal(r.status, 401);
  r = await lea('/api/jahrgang/login', { method: 'POST', body: { klasse: 12, name: 'Lea', code: 'code-zwoelf' } });
  assert.equal(r.status, 200);

  r = await lea('/api/homework', { method: 'POST', body: { fach: 'Deutsch', aufgabe: 'Faust lesen', faellig: '2030-01-15' } });
  assert.equal(r.status, 200);
  const hwId = r.data.id;

  const tom = client();
  await tom('/api/jahrgang/login', { method: 'POST', body: { klasse: 12, name: 'Tom', code: 'code-zwoelf' } });
  r = await tom('/api/homework');
  assert.equal(r.data.length, 1);
  assert.equal(r.data[0].autor, 'Lea');
  assert.equal(r.data[0].eigene, false);
  assert.equal((await tom(`/api/homework/${hwId}`, { method: 'DELETE' })).status, 403);

  const max = client();
  await max('/api/jahrgang/login', { method: 'POST', body: { klasse: 11, name: 'Max', code: 'code-elf' } });
  r = await max('/api/homework');
  assert.equal(r.data.length, 0, 'Klasse 11 sieht nicht die Aufgaben von Klasse 12');

  assert.equal((await lea(`/api/homework/${hwId}`, { method: 'DELETE' })).status, 200);
});

test('Lehrplan und Notizen je Jahrgang', async () => {
  const c = client();
  await c('/api/jahrgang/login', { method: 'POST', body: { klasse: 13, name: 'Mia', code: 'code-dreizehn' } });
  let r = await c('/api/lehrplan');
  assert.equal(r.status, 200);
  assert.equal(r.data.klasse, 13);
  const mathe = r.data.faecher.find((f) => f.id === 'mathe');
  assert.ok(mathe.themen.length > 0);
  const topic = mathe.themen[0];
  assert.ok(topic.zusammenfassung.length > 0);

  r = await c('/api/notes', { method: 'POST', body: { topicId: topic.id, text: 'Kreuzprodukt merken!' } });
  assert.equal(r.status, 200);
  r = await c('/api/notes', { method: 'POST', body: { topicId: 'mathe-11-gibts-nicht', text: 'x' } });
  assert.equal(r.status, 400);
  r = await c(`/api/notes?topic=${encodeURIComponent(topic.id)}`);
  assert.equal(r.data.length, 1);
});

test('Statische Dateien und kein Path-Traversal', async () => {
  let res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /StayPrep/);
  res = await fetch(`${base}/..%2Fpackage.json`);
  assert.equal(res.status, 404);
});
