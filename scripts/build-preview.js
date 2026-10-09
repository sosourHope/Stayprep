// Baut eine eigenständige HTML-Vorschau der App (eine Datei, ohne Server).
// Das echte Frontend wird übernommen; die API ersetzt ein kleines Demo-Backend,
// das alle Daten nur im Browser (localStorage) speichert.
// Aufruf: npm run build:preview  →  dist/vorschau.html
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { KLASSEN, lehrplanFuer } from '../server/lehrplan.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const out = process.argv[2] || path.join(root, 'dist', 'vorschau.html');

const css = read('public/style.css');
const icon = `data:image/svg+xml;base64,${Buffer.from(read('public/icon.svg')).toString('base64')}`;
const lehrplan = Object.fromEntries(KLASSEN.map((k) => [k, lehrplanFuer(k)]));
const demoSalt = 'stayprep-demo';
const demoPwHash = crypto.createHash('sha256').update(demoSalt + 'demo1234').digest('hex');

function replaceOnce(src, from, to) {
  if (!src.includes(from)) throw new Error(`Stelle nicht gefunden: ${from.slice(0, 60)}`);
  return src.replace(from, to);
}

// Frontend: Navigation im Speicher statt über die Adresse (die Vorschau läuft in einem Rahmen).
let app = read('public/app.js');
app = replaceOnce(app, "function currentRoute() {\n  return location.hash.replace(/^#/, '') || '/';\n}",
  "let ROUTE = '/noten';\nfunction currentRoute() {\n  return ROUTE;\n}");
app = replaceOnce(app, 'function go(route) {\n  location.hash = `#${route}`;\n}',
  'function go(route) {\n  ROUTE = route;\n  window.scrollTo(0, 0);\n  router();\n}\nwindow.__go = go;');
app = replaceOnce(app, "h('a', { href: `#${href}`, class:",
  "h('a', { href: `#${href}`, onclick: (e) => { e.preventDefault(); go(href); }, class:");
app = replaceOnce(app, "window.addEventListener('hashchange', router);\n", '');

const demoApi = `
(() => {
  const LEHRPLAN = ${JSON.stringify(lehrplan)};
  const CODES = { 11: 'demo11', 12: 'demo12', 13: 'demo13' };
  const SALT = ${JSON.stringify(demoSalt)};
  const KEY = 'stayprep-vorschau-v1';
  const ARTEN = { klausur: 2, test: 1, muendlich: 1, gfs: 1, sonstiges: 1 };

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
  const iso = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();

  function seed() {
    const userId = 'demo-user';
    const g = (klasse, fach, art, wert, tage, notiz = '') => ({
      id: uid(), userId, klasse, fach, art, wert, gewicht: ARTEN[art], datum: iso(-tage), notiz,
    });
    const hw = (fach, aufgabe, tage, autor, mine = false) => ({
      id: uid(), klasse: 12, fach, aufgabe, faellig: iso(tage), autor,
      memberId: mine ? 'ich' : 'm-' + autor, createdAt: ago(3),
    });
    return {
      users: [{ id: userId, email: 'demo@schule.de', pw: ${JSON.stringify(demoPwHash)} }],
      userSession: userId,
      jg: { klasse: 12, name: 'Lea', memberId: 'ich' },
      grades: [
        g(12, 'Mathematik', 'klausur', 13, 20, 'Kurvendiskussion'),
        g(12, 'Mathematik', 'muendlich', 11, 5),
        g(12, 'Deutsch', 'klausur', 10, 14, 'Lyrikanalyse'),
        g(12, 'Deutsch', 'gfs', 13, 30, 'GFS Romantik'),
        g(12, 'Englisch', 'klausur', 9, 18),
        g(12, 'Englisch', 'test', 11, 6),
        g(12, 'Volks- und Betriebswirtschaftslehre', 'klausur', 14, 10),
        g(12, 'Geschichte mit Gemeinschaftskunde', 'muendlich', 12, 8),
        g(11, 'Mathematik', 'klausur', 2, 200),
        g(11, 'Deutsch', 'klausur', 2.25, 190),
        g(11, 'Englisch', 'muendlich', 1.75, 180),
      ],
      homework: [
        hw('Mathematik', 'Buch S. 112, Nr. 4 a–d (Extrempunkte bestimmen)', 1, 'Lea', true),
        hw('Deutsch', 'Faust I: Szene „Studierzimmer“ lesen und drei Schlüsselzitate markieren', 2, 'Tom'),
        hw('Englisch', 'Write a comment (approx. 250 words): Is the American Dream still alive?', 5, 'Aylin'),
        hw('Chemie', 'Arbeitsblatt Massenwirkungsgesetz fertigstellen', -1, 'Jonas'),
      ],
      notes: [
        { id: uid(), klasse: 12, topicId: 'mathe-12-kurvendiskussion', text: 'Merksatz: f″ < 0 → Hochpunkt, weil der Graph dort „traurig“ (rechtsgekrümmt) ist.', autor: 'Tom', memberId: 'm-Tom', createdAt: ago(2) },
      ],
      done: [],
    };
  }

  let db;
  function load() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
    if (!db || !db.users) db = seed();
    return db;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* nur im Speicher */ }
  }
  window.__resetDemo = () => {
    db = seed();
    save();
    try { Object.keys(localStorage).filter((k) => k.startsWith('hw-') || k.startsWith('lp-') || k === 'noten-klasse').forEach((k) => localStorage.removeItem(k)); } catch {}
  };

  async function sha(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  class E extends Error { constructor(s, m) { super(m); this.status = s; } }
  const fail = (s, m) => { throw new E(s, m); };
  const str = (v, name, min = 1, max = 200) => {
    const s = typeof v === 'string' ? v.trim() : '';
    if (s.length < min || s.length > max) fail(400, name + ' muss ' + min + '–' + max + ' Zeichen lang sein.');
    return s;
  };
  const STUFEN = { 11: 'Eingangsklasse (Klasse 11)', 12: 'Jahrgangsstufe 1 (Klasse 12)', 13: 'Jahrgangsstufe 2 (Klasse 13)' };
  const user = () => { const d = load(); const u = d.users.find((x) => x.id === d.userSession); if (!u) fail(401, 'Bitte melde dich an.'); return u; };
  const jg = () => { const d = load(); if (!d.jg) fail(401, 'Bitte melde dich im Jahrgangsbereich an.'); return d.jg; };
  const topicExists = (k, id) => LEHRPLAN[k].faecher.some((f) => f.themen.some((t) => t.id === id));
  const strip = (o, me) => { const { memberId, klasse, ...r } = o; return { ...r, eigene: memberId === me }; };

  async function handle(method, url, body) {
    const d = load();
    const p = url.pathname;
    let m;
    if (method === 'GET' && p === '/api/me') {
      const u = d.users.find((x) => x.id === d.userSession);
      return { user: u ? { email: u.email } : null, jahrgang: d.jg ? { klasse: d.jg.klasse, name: d.jg.name, stufe: STUFEN[d.jg.klasse] } : null };
    }
    if (method === 'POST' && p === '/api/register') {
      const email = str(body.email, 'E-Mail', 3, 254).toLowerCase();
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) fail(400, 'Bitte gib eine gültige E-Mail-Adresse ein.');
      if (typeof body.password !== 'string' || body.password.length < 8) fail(400, 'Das Passwort muss mindestens 8 Zeichen lang sein.');
      if (d.users.some((u) => u.email === email)) fail(409, 'Für diese E-Mail gibt es schon ein Konto.');
      const u = { id: uid(), email, pw: await sha(body.password) };
      d.users.push(u); d.userSession = u.id; save();
      return { user: { email } };
    }
    if (method === 'POST' && p === '/api/login') {
      const email = String(body.email || '').trim().toLowerCase();
      const u = d.users.find((x) => x.email === email);
      if (!u || u.pw !== (await sha(String(body.password || '')))) fail(401, 'E-Mail oder Passwort ist falsch.');
      d.userSession = u.id; save();
      return { user: { email } };
    }
    if (method === 'POST' && p === '/api/logout') { d.userSession = null; save(); return { ok: true }; }
    if (method === 'GET' && p === '/api/grades') {
      const u = user();
      return { grades: d.grades.filter((g) => g.userId === u.id).map(({ userId, ...g }) => g) };
    }
    if (method === 'POST' && p === '/api/grades') {
      const u = user();
      const k = Number(body.klasse);
      if (![11, 12, 13].includes(k)) fail(400, 'Klasse muss 11, 12 oder 13 sein.');
      const fach = str(body.fach, 'Fach', 1, 60);
      if (!ARTEN[body.art]) fail(400, 'Unbekannte Art der Note.');
      const wert = Number(body.wert);
      if (k === 11 ? !(wert >= 1 && wert <= 6) : !(Number.isInteger(wert) && wert >= 0 && wert <= 15)) fail(400, 'Ungültiger Wert.');
      const gewicht = body.gewicht === undefined || body.gewicht === '' ? ARTEN[body.art] : Number(body.gewicht);
      if (!(gewicht > 0 && gewicht <= 10)) fail(400, 'Gewicht muss zwischen 0 und 10 liegen.');
      const g = { id: uid(), userId: u.id, klasse: k, fach, art: body.art, wert, gewicht, datum: body.datum || null, notiz: body.notiz ? str(body.notiz, 'Notiz', 1, 300) : '' };
      d.grades.push(g); save();
      const { userId, ...r } = g;
      return r;
    }
    if (method === 'DELETE' && (m = p.match(/^\\/api\\/grades\\/([^/]+)$/))) {
      const u = user();
      d.grades = d.grades.filter((g) => !(g.id === m[1] && g.userId === u.id)); save();
      return { ok: true };
    }
    if (method === 'DELETE' && p === '/api/account') {
      const u = user();
      d.grades = d.grades.filter((g) => g.userId !== u.id);
      d.users = d.users.filter((x) => x.id !== u.id);
      d.userSession = null; save();
      return { ok: true };
    }
    if (method === 'POST' && p === '/api/jahrgang/login') {
      const k = Number(body.klasse);
      if (![11, 12, 13].includes(k)) fail(400, 'Klasse muss 11, 12 oder 13 sein.');
      const name = str(body.name, 'Name', 2, 40);
      if (String(body.code || '').trim() !== CODES[k]) fail(401, 'Der Zugangscode für diesen Jahrgang ist falsch. (Vorschau: demo' + k + ')');
      d.jg = { klasse: k, name, memberId: k === 12 && name === 'Lea' ? 'ich' : uid() }; save();
      return { jahrgang: { klasse: k, name, stufe: STUFEN[k] } };
    }
    if (method === 'POST' && p === '/api/jahrgang/logout') { d.jg = null; save(); return { ok: true }; }
    if (method === 'GET' && p === '/api/homework') {
      const j = jg();
      return d.homework.filter((h) => h.klasse === j.klasse)
        .sort((a, b) => a.faellig.localeCompare(b.faellig))
        .map((h) => strip(h, j.memberId));
    }
    if (method === 'POST' && p === '/api/homework') {
      const j = jg();
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(body.faellig || '')) fail(400, 'Fälligkeitsdatum ist kein gültiges Datum.');
      const h = { id: uid(), klasse: j.klasse, fach: str(body.fach, 'Fach', 1, 60), aufgabe: str(body.aufgabe, 'Aufgabe', 1, 1000), faellig: body.faellig, autor: j.name, memberId: j.memberId, createdAt: new Date().toISOString() };
      d.homework.push(h); save();
      return strip(h, j.memberId);
    }
    if (method === 'DELETE' && (m = p.match(/^\\/api\\/homework\\/([^/]+)$/))) {
      const j = jg();
      const h = d.homework.find((x) => x.id === m[1] && x.klasse === j.klasse);
      if (!h) fail(404, 'Eintrag nicht gefunden.');
      if (h.memberId !== j.memberId) fail(403, 'Nur wer den Eintrag erstellt hat, kann ihn löschen.');
      d.homework = d.homework.filter((x) => x !== h); save();
      return { ok: true };
    }
    if (method === 'GET' && p === '/api/lehrplan') return LEHRPLAN[jg().klasse];
    if (method === 'GET' && p === '/api/notes') {
      const j = jg();
      const t = url.searchParams.get('topic') || '';
      return d.notes.filter((n) => n.klasse === j.klasse && n.topicId === t).map((n) => strip(n, j.memberId));
    }
    if (method === 'POST' && p === '/api/notes') {
      const j = jg();
      if (!topicExists(j.klasse, body.topicId)) fail(400, 'Unbekanntes Thema.');
      const n = { id: uid(), klasse: j.klasse, topicId: body.topicId, text: str(body.text, 'Text', 1, 3000), autor: j.name, memberId: j.memberId, createdAt: new Date().toISOString() };
      d.notes.push(n); save();
      return strip(n, j.memberId);
    }
    if (method === 'DELETE' && (m = p.match(/^\\/api\\/notes\\/([^/]+)$/))) {
      const j = jg();
      const n = d.notes.find((x) => x.id === m[1] && x.klasse === j.klasse);
      if (!n || n.memberId !== j.memberId) fail(403, 'Nur wer die Notiz erstellt hat, kann sie löschen.');
      d.notes = d.notes.filter((x) => x !== n); save();
      return { ok: true };
    }
    fail(404, 'Nicht gefunden.');
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, opts = {}) => {
    const url = new URL(String(input), 'https://vorschau.local');
    if (!url.pathname.startsWith('/api/')) return realFetch(input, opts);
    const method = (opts.method || 'GET').toUpperCase();
    let status = 200;
    let data;
    try {
      data = await handle(method, url, opts.body ? JSON.parse(opts.body) : {});
    } catch (e) {
      status = e.status || 500;
      data = { error: e.message };
    }
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  };
})();
`;

const previewCss = `
.preview-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  padding: 8px 16px;
  font-size: .85rem;
  background: var(--private-bg);
  color: var(--private-fg);
}
.preview-bar strong { font-weight: 700; }
.preview-bar code { font: 600 .85rem ui-monospace, SFMono-Regular, Menlo, monospace; }
.preview-bar button { padding: 3px 10px; font-size: .8rem; background: var(--surface); color: var(--text); border: 1px solid var(--border); }
body { background: var(--page); color: var(--text); }
`;

const html = `<title>StayPrep</title>
<meta name="theme-color" content="#0b1f3a">
<link rel="icon" href="${icon}" type="image/svg+xml">
<style>
${css}
${previewCss}
</style>
<div class="preview-bar" role="note" lang="de">
  <span><strong>Vorschau</strong> · Daten bleiben nur in deinem Browser.</span>
  <span>Konto: <code>demo@schule.de</code> / <code>demo1234</code></span>
  <span>Jahrgangscodes: <code>demo11</code> <code>demo12</code> <code>demo13</code></span>
  <button type="button" id="reset-demo">Beispieldaten zurücksetzen</button>
</div>
<header class="topbar" lang="de">
  <a href="#/" class="brand" id="brand"><img src="${icon}" alt="" width="28" height="28"> StayPrep</a>
  <nav id="nav" class="nav"></nav>
</header>
<main id="app" class="container" aria-live="polite" lang="de"></main>
<script>
${demoApi}
</script>
<script type="module">
${app}
document.getElementById('brand').addEventListener('click', (e) => { e.preventDefault(); go('/'); });
document.getElementById('reset-demo').addEventListener('click', async () => {
  window.__resetDemo();
  await refreshMe();
  go('/noten');
});
</script>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`Vorschau geschrieben: ${path.relative(process.cwd(), out)} (${Math.round(html.length / 1024)} KB)`);
