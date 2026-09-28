import fs from 'node:fs';
import path from 'node:path';
import { hashSecret, verifySecret, newToken, tokenHash, newId } from './auth.js';
import { KLASSEN, lehrplanFuer, topicExists, STUFEN } from './lehrplan.js';

const USER_SESSION_DAYS = 30;
const JG_SESSION_DAYS = 180;
const MAX_BODY = 100 * 1024;
const ARTEN = {
  klausur: { label: 'Klassenarbeit / Klausur', gewicht: 2 },
  test: { label: 'Test', gewicht: 1 },
  muendlich: { label: 'Mündlich', gewicht: 1 },
  gfs: { label: 'GFS / Präsentation', gewicht: 1 },
  sonstiges: { label: 'Sonstiges', gewicht: 1 },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const fail = (status, message) => {
  throw new HttpError(status, message);
};

function str(value, name, { min = 1, max = 200 } = {}) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (s.length < min || s.length > max) {
    fail(400, `${name} muss ${min}–${max} Zeichen lang sein.`);
  }
  return s;
}

function isoDate(value, name, { optional = false } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    fail(400, `${name} ist kein gültiges Datum.`);
  }
  return value;
}

function klasse(value) {
  const k = Number(value);
  if (!KLASSEN.includes(k)) fail(400, 'Klasse muss 11, 12 oder 13 sein.');
  return k;
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function createRateLimiter({ max, windowMs }) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}

export function createApp({ db, publicDir, secureCookies = false, rateLimit = { max: 20, windowMs: 15 * 60 * 1000 } }) {
  const { data } = db;
  const allowLogin = createRateLimiter(rateLimit);

  // ---------- Sessions ----------

  function pruneSessions() {
    const now = Date.now();
    const before = data.sessions.length;
    data.sessions = data.sessions.filter((s) => s.expires > now);
    return before !== data.sessions.length;
  }

  function createSession(res, kind, payload, days) {
    const token = newToken();
    const expires = Date.now() + days * 86400 * 1000;
    data.sessions.push({ id: newId(), hash: tokenHash(token), kind, expires, ...payload });
    db.save();
    setCookie(res, kind === 'user' ? 'sid' : 'jg', token, days * 86400);
  }

  function setCookie(res, name, value, maxAge) {
    const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
    if (secureCookies) parts.push('Secure');
    const prev = res.getHeader('Set-Cookie') || [];
    res.setHeader('Set-Cookie', [...prev, parts.join('; ')]);
  }

  function findSession(req, cookieName, kind) {
    const token = parseCookies(req.headers.cookie)[cookieName];
    if (!token) return null;
    const hash = tokenHash(token);
    const s = data.sessions.find((x) => x.hash === hash && x.kind === kind);
    if (!s || s.expires <= Date.now()) return null;
    return s;
  }

  function endSession(req, res, cookieName, kind) {
    const s = findSession(req, cookieName, kind);
    if (s) {
      data.sessions = data.sessions.filter((x) => x !== s);
      db.save();
    }
    setCookie(res, cookieName, '', 0);
  }

  function requireUser(req) {
    const s = findSession(req, 'sid', 'user');
    const user = s && data.users.find((u) => u.id === s.userId);
    if (!user) fail(401, 'Bitte melde dich an.');
    return user;
  }

  function requireJahrgang(req) {
    const s = findSession(req, 'jg', 'jahrgang');
    if (!s) fail(401, 'Bitte melde dich im Jahrgangsbereich an.');
    return s;
  }

  function checkRate(req, what) {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!allowLogin(`${what}:${ip}`)) fail(429, 'Zu viele Versuche. Bitte warte ein paar Minuten.');
  }

  // ---------- Routen ----------

  const routes = [];
  const route = (method, pattern, fn) => {
    const keys = [];
    const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}$`);
    routes.push({ method, re, keys, fn });
  };

  route('GET', '/api/me', (req) => {
    const us = findSession(req, 'sid', 'user');
    const user = us && data.users.find((u) => u.id === us.userId);
    const jg = findSession(req, 'jg', 'jahrgang');
    return {
      user: user ? { email: user.email } : null,
      jahrgang: jg ? { klasse: jg.klasse, name: jg.name, stufe: STUFEN[jg.klasse] } : null,
    };
  });

  // --- Privates Konto (Noten) ---

  route('POST', '/api/register', async (req, res, body) => {
    checkRate(req, 'register');
    const email = str(body.email, 'E-Mail', { min: 3, max: 254 }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Bitte gib eine gültige E-Mail-Adresse ein.');
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 8 || password.length > 200) fail(400, 'Das Passwort muss mindestens 8 Zeichen lang sein.');
    if (data.users.some((u) => u.email === email)) fail(409, 'Für diese E-Mail gibt es schon ein Konto.');
    const user = { id: newId(), email, passwordHash: await hashSecret(password), createdAt: new Date().toISOString() };
    data.users.push(user);
    createSession(res, 'user', { userId: user.id }, USER_SESSION_DAYS);
    return { user: { email } };
  });

  route('POST', '/api/login', async (req, res, body) => {
    checkRate(req, 'login');
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const user = data.users.find((u) => u.email === email);
    const ok = await verifySecret(password, user?.passwordHash);
    if (!user || !ok) fail(401, 'E-Mail oder Passwort ist falsch.');
    pruneSessions();
    createSession(res, 'user', { userId: user.id }, USER_SESSION_DAYS);
    return { user: { email: user.email } };
  });

  route('POST', '/api/logout', (req, res) => {
    endSession(req, res, 'sid', 'user');
    return { ok: true };
  });

  route('GET', '/api/grades', (req) => {
    const user = requireUser(req);
    return {
      arten: ARTEN,
      grades: data.grades.filter((g) => g.userId === user.id).map(({ userId, ...g }) => g),
    };
  });

  route('POST', '/api/grades', (req, res, body) => {
    const user = requireUser(req);
    const k = klasse(body.klasse);
    const fach = str(body.fach, 'Fach', { max: 60 });
    const art = ARTEN[body.art] ? body.art : fail(400, 'Unbekannte Art der Note.');
    const wert = Number(body.wert);
    if (k === 11) {
      if (!(wert >= 1 && wert <= 6)) fail(400, 'In Klasse 11 gibt es Noten von 1 bis 6.');
    } else if (!(Number.isInteger(wert) && wert >= 0 && wert <= 15)) {
      fail(400, 'In der Jahrgangsstufe gibt es Punkte von 0 bis 15.');
    }
    const gewicht = body.gewicht === undefined || body.gewicht === '' ? ARTEN[art].gewicht : Number(body.gewicht);
    if (!(gewicht > 0 && gewicht <= 10)) fail(400, 'Gewicht muss zwischen 0 und 10 liegen.');
    const grade = {
      id: newId(),
      userId: user.id,
      klasse: k,
      fach,
      art,
      wert: Math.round(wert * 100) / 100,
      gewicht,
      datum: isoDate(body.datum, 'Datum', { optional: true }),
      notiz: body.notiz ? str(body.notiz, 'Notiz', { max: 300 }) : '',
    };
    data.grades.push(grade);
    db.save();
    const { userId, ...out } = grade;
    return out;
  });

  route('DELETE', '/api/grades/:id', (req, res, body, params) => {
    const user = requireUser(req);
    const before = data.grades.length;
    data.grades = data.grades.filter((g) => !(g.id === params.id && g.userId === user.id));
    if (before === data.grades.length) fail(404, 'Note nicht gefunden.');
    db.save();
    return { ok: true };
  });

  route('DELETE', '/api/account', async (req, res, body) => {
    const user = requireUser(req);
    data.grades = data.grades.filter((g) => g.userId !== user.id);
    data.sessions = data.sessions.filter((s) => s.userId !== user.id);
    data.users = data.users.filter((u) => u.id !== user.id);
    db.save();
    setCookie(res, 'sid', '', 0);
    return { ok: true };
  });

  // --- Jahrgangsbereich (öffentlich für den Jahrgang, eigener Zugang) ---

  route('POST', '/api/jahrgang/login', async (req, res, body) => {
    checkRate(req, 'jahrgang');
    const k = klasse(body.klasse);
    const name = str(body.name, 'Name', { min: 2, max: 40 });
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const ok = await verifySecret(code, data.jahrgaenge[k]?.codeHash);
    if (!ok) fail(401, 'Der Zugangscode für diesen Jahrgang ist falsch.');
    pruneSessions();
    createSession(res, 'jahrgang', { klasse: k, name, memberId: newId() }, JG_SESSION_DAYS);
    return { jahrgang: { klasse: k, name, stufe: STUFEN[k] } };
  });

  route('POST', '/api/jahrgang/logout', (req, res) => {
    endSession(req, res, 'jg', 'jahrgang');
    return { ok: true };
  });

  route('GET', '/api/homework', (req) => {
    const jg = requireJahrgang(req);
    return data.homework
      .filter((h) => h.klasse === jg.klasse)
      .sort((a, b) => a.faellig.localeCompare(b.faellig) || a.createdAt.localeCompare(b.createdAt))
      .map(({ memberId, klasse: _k, ...h }) => ({ ...h, eigene: memberId === jg.memberId }));
  });

  route('POST', '/api/homework', (req, res, body) => {
    const jg = requireJahrgang(req);
    const hw = {
      id: newId(),
      klasse: jg.klasse,
      fach: str(body.fach, 'Fach', { max: 60 }),
      aufgabe: str(body.aufgabe, 'Aufgabe', { max: 1000 }),
      faellig: isoDate(body.faellig, 'Fälligkeitsdatum'),
      autor: jg.name,
      memberId: jg.memberId,
      createdAt: new Date().toISOString(),
    };
    data.homework.push(hw);
    db.save();
    const { memberId, klasse: _k, ...out } = hw;
    return { ...out, eigene: true };
  });

  route('DELETE', '/api/homework/:id', (req, res, body, params) => {
    const jg = requireJahrgang(req);
    const hw = data.homework.find((h) => h.id === params.id && h.klasse === jg.klasse);
    if (!hw) fail(404, 'Eintrag nicht gefunden.');
    if (hw.memberId !== jg.memberId) fail(403, 'Nur wer den Eintrag erstellt hat, kann ihn löschen.');
    data.homework = data.homework.filter((h) => h !== hw);
    db.save();
    return { ok: true };
  });

  route('GET', '/api/lehrplan', (req) => {
    const jg = requireJahrgang(req);
    return lehrplanFuer(jg.klasse);
  });

  route('GET', '/api/notes', (req, res, body, params, query) => {
    const jg = requireJahrgang(req);
    const topicId = query.get('topic') || '';
    return data.notes
      .filter((n) => n.klasse === jg.klasse && n.topicId === topicId)
      .map(({ memberId, klasse: _k, ...n }) => ({ ...n, eigene: memberId === jg.memberId }));
  });

  route('POST', '/api/notes', (req, res, body) => {
    const jg = requireJahrgang(req);
    const topicId = typeof body.topicId === 'string' ? body.topicId : '';
    if (!topicExists(jg.klasse, topicId)) fail(400, 'Unbekanntes Thema.');
    const note = {
      id: newId(),
      klasse: jg.klasse,
      topicId,
      text: str(body.text, 'Text', { max: 3000 }),
      autor: jg.name,
      memberId: jg.memberId,
      createdAt: new Date().toISOString(),
    };
    data.notes.push(note);
    db.save();
    const { memberId, klasse: _k, ...out } = note;
    return { ...out, eigene: true };
  });

  route('DELETE', '/api/notes/:id', (req, res, body, params) => {
    const jg = requireJahrgang(req);
    const note = data.notes.find((n) => n.id === params.id && n.klasse === jg.klasse);
    if (!note) fail(404, 'Notiz nicht gefunden.');
    if (note.memberId !== jg.memberId) fail(403, 'Nur wer die Notiz erstellt hat, kann sie löschen.');
    data.notes = data.notes.filter((n) => n !== note);
    db.save();
    return { ok: true };
  });

  // ---------- HTTP-Plumbing ----------

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY) {
          reject(new HttpError(413, 'Anfrage zu groß.'));
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  function send(res, status, payload) {
    const json = JSON.stringify(payload);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(json);
  }

  async function handleApi(req, res, url) {
    const r = routes.find((x) => x.method === req.method && x.re.test(url.pathname));
    if (!r) fail(404, 'Nicht gefunden.');
    const m = url.pathname.match(r.re);
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    let body = {};
    if (req.method === 'POST') {
      // Nur JSON akzeptieren: fremde Seiten können so keine Formulare "unterschieben" (CSRF-Schutz).
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
        fail(415, 'Content-Type muss application/json sein.');
      }
      const raw = await readBody(req);
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        fail(400, 'Ungültiges JSON.');
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Ungültiger Inhalt.');
    }
    const result = await r.fn(req, res, body, params, url.searchParams);
    send(res, 200, result);
  }

  function serveStatic(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') fail(405, 'Methode nicht erlaubt.');
    const rel = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.normalize(path.join(publicDir, decodeURIComponent(rel)));
    if (!file.startsWith(path.resolve(publicDir) + path.sep)) fail(404, 'Nicht gefunden.');
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      fail(404, 'Nicht gefunden.');
    }
    if (!stat.isFile()) fail(404, 'Nicht gefunden.');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  }

  return async function handler(req, res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
      else serveStatic(req, res, url);
    } catch (err) {
      if (err instanceof HttpError) {
        if (!res.headersSent) send(res, err.status, { error: err.message });
      } else if (err instanceof URIError) {
        if (!res.headersSent) send(res, 400, { error: 'Ungültige Adresse.' });
      } else {
        console.error(err);
        if (!res.headersSent) send(res, 500, { error: 'Interner Fehler.' });
      }
    }
  };
}

/** Legt fehlende Jahrgangs-Zugangscodes an (aus Umgebungsvariablen oder zufällig). */
export async function ensureJahrgangCodes(db, env = process.env, log = console.log) {
  for (const k of KLASSEN) {
    const fromEnv = env[`JAHRGANG_CODE_${k}`];
    const entry = db.data.jahrgaenge[k];
    if (fromEnv && !(entry && (await verifySecret(fromEnv, entry.codeHash)))) {
      db.data.jahrgaenge[k] = { codeHash: await hashSecret(fromEnv) };
      log(`Zugangscode für Klasse ${k} aus JAHRGANG_CODE_${k} übernommen.`);
    } else if (!entry) {
      const code = newToken().slice(0, 10);
      db.data.jahrgaenge[k] = { codeHash: await hashSecret(code) };
      log(`Neuer Zugangscode für Klasse ${k}: ${code}   (nur jetzt sichtbar – bitte notieren!)`);
    }
  }
  db.save();
}
