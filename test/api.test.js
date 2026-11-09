import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../server/db.js';
import { createApp, ensureJahrgangCodes } from '../server/app.js';
import { createSmtpMailer, createBrevoMailer, mailerFromEnv } from '../server/mail.js';
import net from 'node:net';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let server;
let base;
const mails = [];

before(async () => {
  const db = openDb(null);
  await ensureJahrgangCodes(db, { JAHRGANG_CODE_11: 'code-elf', JAHRGANG_CODE_12: 'code-zwoelf', JAHRGANG_CODE_13: 'code-dreizehn' }, () => {});
  const handler = createApp({
    db,
    publicDir: path.join(root, 'public'),
    rateLimit: { max: 1000, windowMs: 60000 },
    appUrl: 'https://stayprep.example',
    sendMail: async (mail) => { mails.push(mail); },
  });
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

test('Eigene Notizen zu Lehrplan-Themen sind privat', async () => {
  const topicId = 'mathe-12-kurvendiskussion';
  const a = client();
  assert.equal((await a('/api/mynotes?topic=' + topicId)).status, 401);
  await a('/api/register', { method: 'POST', body: { email: 'notiz@example.de', password: 'geheim123' } });
  let r = await a('/api/mynotes', { method: 'POST', body: { topicId, text: 'f″ > 0 → Tiefpunkt' } });
  assert.equal(r.status, 200);
  r = await a('/api/mynotes?topic=' + topicId);
  assert.equal(r.data.text, 'f″ > 0 → Tiefpunkt');
  assert.equal((await a('/api/mynotes', { method: 'POST', body: { topicId: 'gibts-nicht', text: 'x' } })).status, 400);

  const b = client();
  await b('/api/register', { method: 'POST', body: { email: 'andere@example.de', password: 'geheim123' } });
  r = await b('/api/mynotes?topic=' + topicId);
  assert.equal(r.data.text, '', 'andere Konten sehen die Notiz nicht');

  await a('/api/mynotes', { method: 'POST', body: { topicId, text: '' } });
  r = await a('/api/mynotes?topic=' + topicId);
  assert.equal(r.data.text, '');
});

test('Passwort vergessen: Link per E-Mail, neues Passwort, alte Anmeldungen enden', async () => {
  const alt = client();
  await alt('/api/register', { method: 'POST', body: { email: 'vergesslich@example.de', password: 'altes-passwort' } });

  const c = client();
  // Unbekannte Adresse: gleiche Antwort, aber keine Mail
  let r = await c('/api/password/forgot', { method: 'POST', body: { email: 'niemand@example.de' } });
  assert.equal(r.status, 200);
  assert.equal(mails.length, 0);

  r = await c('/api/password/forgot', { method: 'POST', body: { email: 'Vergesslich@Example.de' } });
  assert.equal(r.status, 200);
  await new Promise((done) => setTimeout(done, 10));
  assert.equal(mails.length, 1);
  assert.equal(mails[0].to, 'vergesslich@example.de');
  const token = mails[0].text.match(/https:\/\/stayprep\.example\/#\/reset\/([\w-]+)/)?.[1];
  assert.ok(token, 'Mail enthält den Link');

  r = await c('/api/password/reset', { method: 'POST', body: { token: 'falsch', password: 'neues-passwort' } });
  assert.equal(r.status, 400);
  r = await c('/api/password/reset', { method: 'POST', body: { token, password: 'kurz' } });
  assert.equal(r.status, 400);
  r = await c('/api/password/reset', { method: 'POST', body: { token, password: 'neues-passwort' } });
  assert.equal(r.status, 200);
  assert.equal((await c('/api/grades')).status, 200, 'nach dem Zurücksetzen angemeldet');

  // Link nur einmal gültig, alte Sitzung beendet, nur neues Passwort gilt
  assert.equal((await c('/api/password/reset', { method: 'POST', body: { token, password: 'nochmal-neu' } })).status, 400);
  assert.equal((await alt('/api/grades')).status, 401);
  const d = client();
  assert.equal((await d('/api/login', { method: 'POST', body: { email: 'vergesslich@example.de', password: 'altes-passwort' } })).status, 401);
  assert.equal((await d('/api/login', { method: 'POST', body: { email: 'vergesslich@example.de', password: 'neues-passwort' } })).status, 200);
});

test('SMTP-Versand an einen Test-Mailserver', async () => {
  const received = { commands: [], data: '' };
  const smtp = net.createServer((sock) => {
    let inData = false;
    let buf = '';
    sock.write('220 test ESMTP\r\n');
    sock.on('data', (chunk) => {
      buf += chunk;
      let i;
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (inData) {
          if (line === '.') { inData = false; sock.write('250 OK queued\r\n'); } else received.data += line + '\n';
          continue;
        }
        received.commands.push(line);
        if (line.startsWith('EHLO')) sock.write('250-test\r\n250 AUTH LOGIN\r\n');
        else if (line === 'AUTH LOGIN') sock.write('334 VXNlcm5hbWU6\r\n');
        else if (received.commands.length === 3) sock.write('334 UGFzc3dvcmQ6\r\n');
        else if (received.commands.length === 4) sock.write('235 OK\r\n');
        else if (line === 'DATA') { inData = true; sock.write('354 go\r\n'); } else if (line === 'QUIT') sock.end('221 bye\r\n');
        else sock.write('250 OK\r\n');
      }
    });
  });
  await new Promise((done) => smtp.listen(0, done));
  const send = createSmtpMailer({
    host: '127.0.0.1', port: smtp.address().port, secure: false, starttls: false,
    user: 'stayprep', pass: 'geheim', from: 'noreply@stayprep.example',
  });
  await send({ to: 'lea@example.de', subject: 'StayPrep: Passwort zurücksetzen', text: 'Hallo Lea,\n.Punkt am Anfang\nhttps://x/#/reset/abc' });
  smtp.close();

  assert.deepEqual(received.commands.slice(0, 2), ['EHLO stayprep.example', 'AUTH LOGIN']);
  assert.equal(Buffer.from(received.commands[2], 'base64').toString(), 'stayprep');
  assert.ok(received.commands.includes('MAIL FROM:<noreply@stayprep.example>'));
  assert.ok(received.commands.includes('RCPT TO:<lea@example.de>'));
  const [head, body] = received.data.split('\n\n');
  assert.match(head, /Subject: =\?UTF-8\?B\?/);
  assert.equal(Buffer.from(body.replace(/\n/g, ''), 'base64').toString(), 'Hallo Lea,\n.Punkt am Anfang\nhttps://x/#/reset/abc');
});

test('Anmeldelink per E-Mail meldet einmalig an', async () => {
  const reg = client();
  await reg('/api/register', { method: 'POST', body: { email: 'link@example.de', password: 'geheim123' } });
  const before = mails.length;

  const c = client();
  let r = await c('/api/login/link', { method: 'POST', body: { email: 'unbekannt@example.de' } });
  assert.equal(r.status, 200);
  r = await c('/api/login/link', { method: 'POST', body: { email: 'LINK@example.de' } });
  assert.equal(r.status, 200);
  await new Promise((done) => setTimeout(done, 10));
  assert.equal(mails.length, before + 1, 'nur eine Mail, nur für das bekannte Konto');
  const mail = mails.at(-1);
  assert.equal(mail.to, 'link@example.de');
  const token = mail.text.match(/\/#\/login\/([\w-]+)/)?.[1];
  assert.ok(token);

  // Ein Anmeldelink taugt nicht zum Passwort-Zurücksetzen
  assert.equal((await c('/api/password/reset', { method: 'POST', body: { token, password: 'neues-passwort' } })).status, 400);
  r = await c('/api/login/token', { method: 'POST', body: { token } });
  assert.equal(r.status, 200);
  assert.equal((await c('/api/grades')).status, 200);
  assert.equal((await c('/api/login/token', { method: 'POST', body: { token } })).status, 400, 'nur einmal gültig');
});

test('Health-Check für den Hoster', async () => {
  const r = await client()('/api/health');
  assert.deepEqual(r.data, { ok: true });
});

test('Brevo-Versand ruft die API richtig auf', async () => {
  const calls = [];
  const send = createBrevoMailer({
    apiKey: 'test-key',
    from: 'noreply@stayprep.example',
    fetchImpl: async (url, opts) => { calls.push({ url, opts }); return { ok: true, text: async () => '' }; },
  });
  await send({ to: 'lea@example.de', subject: 'Betreff', text: 'Text' });
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(calls[0].opts.headers['api-key'], 'test-key');
  assert.deepEqual(JSON.parse(calls[0].opts.body), {
    sender: { email: 'noreply@stayprep.example', name: 'StayPrep' },
    to: [{ email: 'lea@example.de' }],
    subject: 'Betreff',
    textContent: 'Text',
  });

  const failing = createBrevoMailer({ apiKey: 'k', from: 'a@b.de', fetchImpl: async () => ({ ok: false, status: 401, text: async () => 'unauthorized' }) });
  await assert.rejects(failing({ to: 'x@y.de', subject: 's', text: 't' }), /Brevo-Fehler 401/);

  assert.equal(mailerFromEnv({}).kind, null);
  assert.equal(mailerFromEnv({ BREVO_API_KEY: 'k', MAIL_FROM: 'a@b.de' }).kind, 'Brevo');
  assert.match(mailerFromEnv({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.de' }).kind, /SMTP/);
});
