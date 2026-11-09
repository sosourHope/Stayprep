// StayPrep – Frontend (ohne Framework). Alle Nutzereingaben werden über
// textContent eingefügt, nie als HTML.

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const state = { user: null, jahrgang: null };

const FAECHER = [
  'Deutsch', 'Mathematik', 'Englisch', 'Geschichte', 'Gemeinschaftskunde/Rechtserziehung', 'Ethik', 'Religion', 'Sport',
  'Physik', 'Chemie', 'Biologie', 'Informatik', 'Informatiksysteme', 'Volks- und Betriebswirtschaftslehre',
  'Wirtschaftslehre/Recht', 'Französisch', 'Spanisch', 'Russisch', 'Fachrichtungsfach',
];

const ARTEN = {
  klausur: { label: 'Klassenarbeit / Klausur', gewicht: 2 },
  test: { label: 'Test', gewicht: 1 },
  muendlich: { label: 'Mündlich', gewicht: 1 },
  gfs: { label: 'Präsentation / Komplexe Leistung', gewicht: 1 },
  sonstiges: { label: 'Sonstiges', gewicht: 1 },
};

const PUNKTE_NOTE = ['6', '5-', '5', '5+', '4-', '4', '4+', '3-', '3', '3+', '2-', '2', '2+', '1-', '1', '1+'];
const NOTEN_11 = [
  [1, '1'], [1.25, '1-'], [1.5, '1-2'], [1.75, '2+'], [2, '2'], [2.25, '2-'], [2.5, '2-3'], [2.75, '3+'],
  [3, '3'], [3.25, '3-'], [3.5, '3-4'], [3.75, '4+'], [4, '4'], [4.25, '4-'], [4.5, '4-5'], [4.75, '5+'],
  [5, '5'], [5.25, '5-'], [5.5, '5-6'], [6, '6'],
];

// ---------- Helfer ----------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Unbekannter Fehler');
    err.status = res.status;
    throw err;
  }
  return data;
}

function store(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return null;
  }
  return value;
}

/** Button, der erst nach einem zweiten Klick auslöst (statt confirm()). */
function confirmButton(label, question, action, attrs = {}) {
  let armed = false;
  let timer;
  const btn = h('button', {
    class: 'link',
    ...attrs,
    onclick: async () => {
      if (!armed) {
        armed = true;
        btn.textContent = question;
        btn.classList.add('armed');
        timer = setTimeout(() => {
          armed = false;
          btn.textContent = label;
          btn.classList.remove('armed');
        }, 4000);
        return;
      }
      clearTimeout(timer);
      btn.disabled = true;
      try {
        await action();
      } finally {
        btn.disabled = false;
      }
    },
  }, label);
  return btn;
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function submitHandler(fn) {
  return async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const errorEl = form.querySelector('.error');
    const btn = form.querySelector('button[type="submit"]');
    if (errorEl) errorEl.textContent = '';
    if (btn) btn.disabled = true;
    try {
      await fn(formValues(form), form);
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  };
}

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date();
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((a - b) / 86400000);
}

function fmt(n, digits = 2) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function wertLabel(klasse, wert) {
  if (klasse === 11) {
    const hit = NOTEN_11.find(([v]) => v === wert);
    return hit ? hit[1] : fmt(wert, 2);
  }
  return `${wert} P.`;
}

// ---------- Navigation ----------

function currentRoute() {
  return location.hash.replace(/^#/, '') || '/';
}

function go(route) {
  location.hash = `#${route}`;
}

function renderNav() {
  const route = currentRoute();
  const links = [['/', 'Start']];
  if (state.user) links.push(['/noten', 'Meine Noten']);
  if (state.jahrgang) links.push(['/hausaufgaben', 'Hausaufgaben'], ['/lehrplan', 'Lehrplan']);
  nav.replaceChildren(
    ...links.map(([href, label]) => h('a', { href: `#${href}`, class: route === href ? 'active' : '' }, label)),
  );
}

async function refreshMe() {
  const me = await api('/api/me');
  state.user = me.user;
  state.jahrgang = me.jahrgang;
}

const views = {
  '/': viewHome,
  '/noten': viewNoten,
  '/hausaufgaben': viewHausaufgaben,
  '/lehrplan': viewLehrplan,
};

async function router() {
  const route = currentRoute();
  let view = views[route] || viewHome;
  if (route.startsWith('/reset/')) view = () => viewReset(route.slice('/reset/'.length));
  if (route.startsWith('/login/')) view = () => viewLoginLink(route.slice('/login/'.length));
  renderNav();
  app.replaceChildren(h('p', { class: 'muted' }, 'Lädt …'));
  try {
    await view();
  } catch (err) {
    if (err.status === 401) {
      await refreshMe();
      go('/');
      return;
    }
    app.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'error' }, err.message)));
  }
  renderNav();
}

// ---------- Start ----------

function viewHome() {
  app.replaceChildren(
    h('h1', {}, 'Willkommen bei StayPrep'),
    h('p', { class: 'sub' }, 'Noten, Hausaufgaben und Lernstoff für das berufliche Gymnasium (Klasse 11–13).'),
    h('div', { class: 'grid' }, userCard(), jahrgangCard()),
  );
}

function userCard() {
  if (state.user) {
    return h('section', { class: 'card' },
      h('span', { class: 'badge private' }, 'Privat'),
      h('h2', {}, 'Meine Noten'),
      h('p', {}, 'Angemeldet als ', h('strong', {}, state.user.email)),
      h('p', { class: 'muted small' }, 'Deine Noten sieht nur du.'),
      h('div', { class: 'row' },
        h('button', { onclick: () => (go('/noten')) }, 'Zu meinen Noten'),
        h('button', {
          class: 'secondary',
          onclick: async () => {
            await api('/api/logout', { method: 'POST', body: {} });
            state.user = null;
            viewHome();
            renderNav();
          },
        }, 'Abmelden'),
      ),
    );
  }

  let mode = 'login';
  let sentTo = '';
  const card = h('section', { class: 'card' });
  const switchTo = (m) => () => {
    mode = m;
    draw();
  };
  const draw = () => {
    if (mode === 'forgot' || mode === 'link') return drawMailRequest();
    const isLogin = mode === 'login';
    card.replaceChildren(
      h('span', { class: 'badge private' }, 'Privat'),
      h('h2', {}, isLogin ? 'Anmelden – Meine Noten' : 'Konto erstellen'),
      h('p', { class: 'muted small' }, 'Dein privater Bereich mit E-Mail und Passwort. Nur du siehst deine Noten.'),
      h('form', {
        onsubmit: submitHandler(async (v) => {
          const res = await api(isLogin ? '/api/login' : '/api/register', { method: 'POST', body: v });
          state.user = res.user;
          go('/noten');
        }),
      },
        h('label', {}, 'E-Mail', h('input', { name: 'email', type: 'email', required: true, autocomplete: 'email' })),
        h('label', {}, 'Passwort', h('input', {
          name: 'password', type: 'password', required: true, minLength: isLogin ? 1 : 8,
          autocomplete: isLogin ? 'current-password' : 'new-password',
        })),
        !isLogin && h('p', { class: 'muted small' }, 'Mindestens 8 Zeichen.'),
        h('p', { class: 'error' }),
        h('button', { type: 'submit' }, isLogin ? 'Anmelden' : 'Registrieren'),
      ),
      h('div', { class: 'card-links' },
        isLogin && h('button', { class: 'link', onclick: switchTo('link') }, 'Anmeldelink per E-Mail'),
        isLogin && h('button', { class: 'link', onclick: switchTo('forgot') }, 'Passwort vergessen?'),
        h('button', { class: 'link', onclick: switchTo(isLogin ? 'register' : 'login') },
          isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Schon ein Konto? Anmelden'),
      ),
    );
  };
  // „Passwort vergessen“ und „Anmeldelink per E-Mail“ funktionieren gleich: Adresse eingeben, Link kommt per Mail.
  const drawMailRequest = () => {
    const forgot = mode === 'forgot';
    const minutes = forgot ? 60 : 15;
    card.replaceChildren(
      h('span', { class: 'badge private' }, 'Privat'),
      h('h2', {}, forgot ? 'Passwort vergessen' : 'Anmeldelink per E-Mail'),
      sentTo
        ? h('div', { class: 'hint' },
          h('p', {}, 'Falls es für ', h('strong', {}, sentTo), ' ein Konto gibt, haben wir dir eine E-Mail mit einem Link geschickt.'),
          h('p', { class: 'small' }, `Der Link ist ${minutes} Minuten gültig. Schau auch im Spam-Ordner nach.`))
        : h('p', { class: 'muted small' }, forgot
          ? 'Gib die E-Mail-Adresse deines Kontos ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.'
          : 'Gib die E-Mail-Adresse deines Kontos ein. Wir schicken dir einen Link, mit dem du dich ohne Passwort anmeldest.'),
      sentTo ? '' : h('form', {
        onsubmit: submitHandler(async (v) => {
          const res = await api(forgot ? '/api/password/forgot' : '/api/login/link', { method: 'POST', body: v });
          sentTo = v.email.trim();
          drawMailRequest();
          // Nur in der Vorschau: Dort gibt es keinen Mailversand, der Link kommt direkt zurück.
          if (res.demoLink) {
            card.append(h('button', { type: 'button', onclick: () => go(res.demoLink) }, 'E-Mail-Link öffnen (Vorschau)'));
          }
        }),
      },
        h('label', {}, 'E-Mail', h('input', { name: 'email', type: 'email', required: true, autocomplete: 'email' })),
        h('p', { class: 'error' }),
        h('button', { type: 'submit' }, 'Link senden'),
      ),
      h('div', { class: 'card-links' },
        h('button', { class: 'link', onclick: () => { sentTo = ''; switchTo('login')(); } }, 'Zurück zur Anmeldung'),
      ),
    );
  };
  draw();
  return card;
}

async function viewLoginLink(token) {
  try {
    const res = await api('/api/login/token', { method: 'POST', body: { token } });
    state.user = res.user;
    // Den Link aus dem Browserverlauf entfernen.
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch {
      // ignorieren
    }
    go('/noten');
  } catch (err) {
    app.replaceChildren(h('section', { class: 'card narrow' },
      h('h1', {}, 'Anmeldung per Link'),
      h('p', { class: 'error' }, err.message),
      h('button', { type: 'button', onclick: () => go('/') }, 'Zur Anmeldung'),
    ));
  }
}

function viewReset(token) {
  app.replaceChildren(
    h('section', { class: 'card narrow' },
      h('span', { class: 'badge private' }, 'Privat'),
      h('h1', {}, 'Neues Passwort festlegen'),
      h('p', { class: 'muted small' }, 'Wähle ein neues Passwort für dein Konto. Danach bist du direkt angemeldet, und alle anderen Anmeldungen werden beendet.'),
      h('form', {
        onsubmit: submitHandler(async (v) => {
          if (v.password !== v.password2) throw new Error('Die beiden Passwörter stimmen nicht überein.');
          const res = await api('/api/password/reset', { method: 'POST', body: { token, password: v.password } });
          state.user = res.user;
          // Den Link aus dem Browserverlauf entfernen.
          try {
            history.replaceState(null, '', location.pathname + location.search);
          } catch {
            // ignorieren
          }
          go('/noten');
        }),
      },
        h('label', {}, 'Neues Passwort', h('input', { name: 'password', type: 'password', required: true, minLength: 8, autocomplete: 'new-password' })),
        h('label', {}, 'Neues Passwort wiederholen', h('input', { name: 'password2', type: 'password', required: true, minLength: 8, autocomplete: 'new-password' })),
        h('p', { class: 'muted small' }, 'Mindestens 8 Zeichen.'),
        h('p', { class: 'error' }),
        h('button', { type: 'submit' }, 'Passwort speichern'),
      ),
    ),
  );
}

function jahrgangCard() {
  if (state.jahrgang) {
    const jg = state.jahrgang;
    return h('section', { class: 'card' },
      h('span', { class: 'badge' }, 'Jahrgang'),
      h('h2', {}, jg.stufe),
      h('p', {}, 'Du bist als ', h('strong', {}, jg.name), ' im Jahrgangsbereich angemeldet.'),
      h('p', { class: 'muted small' }, 'Hausaufgabenheft, Lehrplan und Lernzusammenfassungen – gemeinsam für den ganzen Jahrgang.'),
      h('div', { class: 'row' },
        h('button', { onclick: () => (go('/hausaufgaben')) }, 'Hausaufgaben'),
        h('button', { onclick: () => (go('/lehrplan')) }, 'Lehrplan'),
        h('button', {
          class: 'secondary',
          onclick: async () => {
            await api('/api/jahrgang/logout', { method: 'POST', body: {} });
            state.jahrgang = null;
            viewHome();
            renderNav();
          },
        }, 'Verlassen'),
      ),
    );
  }
  return h('section', { class: 'card' },
    h('span', { class: 'badge' }, 'Jahrgang'),
    h('h2', {}, 'Jahrgangsbereich betreten'),
    h('p', { class: 'muted small' },
      'Öffentlich für deinen Jahrgang: Hausaufgabenheft, Lehrplan und Lernzusammenfassungen. Den Zugangscode bekommst du von deiner Klasse bzw. Lehrkraft.'),
    h('form', {
      onsubmit: submitHandler(async (v) => {
        const res = await api('/api/jahrgang/login', { method: 'POST', body: v });
        state.jahrgang = res.jahrgang;
        go('/hausaufgaben');
      }),
    },
      h('label', {}, 'Klasse',
        h('select', { name: 'klasse', required: true },
          h('option', { value: '11' }, 'Klasse 11 – Einführungsphase'),
          h('option', { value: '12' }, 'Jahrgangsstufe 12'),
          h('option', { value: '13' }, 'Jahrgangsstufe 13'),
        ),
      ),
      h('label', {}, 'Dein Name (für andere sichtbar)', h('input', { name: 'name', required: true, minLength: 2, maxLength: 40, autocomplete: 'nickname' })),
      h('label', {}, 'Zugangscode des Jahrgangs', h('input', { name: 'code', type: 'password', required: true, autocomplete: 'off' })),
      h('p', { class: 'error' }),
      h('button', { type: 'submit' }, 'Betreten'),
    ),
  );
}

// ---------- Noten (privat) ----------

async function viewNoten() {
  if (!state.user) {
    go('/');
    return;
  }
  const { grades } = await api('/api/grades');
  let klasse = store('noten-klasse') || state.jahrgang?.klasse || 11;

  const draw = () => {
    store('noten-klasse', klasse);
    const list = grades.filter((g) => g.klasse === klasse);
    const isPunkte = klasse !== 11;

    // Durchschnitt pro Fach (gewichtet), Gesamtschnitt = Mittel der Fachschnitte
    const bySubject = new Map();
    for (const g of list) {
      if (!bySubject.has(g.fach)) bySubject.set(g.fach, []);
      bySubject.get(g.fach).push(g);
    }
    const subjects = [...bySubject.entries()]
      .map(([fach, gs]) => {
        const w = gs.reduce((s, g) => s + g.gewicht, 0);
        const avg = gs.reduce((s, g) => s + g.wert * g.gewicht, 0) / w;
        return { fach, gs: gs.sort((a, b) => (a.datum || '').localeCompare(b.datum || '')), avg };
      })
      .sort((a, b) => a.fach.localeCompare(b.fach, 'de'));
    const overall = subjects.length ? subjects.reduce((s, x) => s + x.avg, 0) / subjects.length : null;

    const wertInput = isPunkte
      ? h('select', { name: 'wert', required: true },
        ...Array.from({ length: 16 }, (_, i) => 15 - i).map((p) => h('option', { value: p }, `${p} Punkte (${PUNKTE_NOTE[p]})`)))
      : h('select', { name: 'wert', required: true }, ...NOTEN_11.map(([v, l]) => h('option', { value: v }, l)));

    const gewichtInput = h('input', { name: 'gewicht', type: 'number', min: '0.5', max: '10', step: '0.5', value: 2 });
    const artSelect = h('select', {
      name: 'art',
      onchange: (e) => (gewichtInput.value = ARTEN[e.target.value].gewicht),
    }, ...Object.entries(ARTEN).map(([k, a]) => h('option', { value: k }, a.label)));

    app.replaceChildren(
      h('h1', {}, 'Meine Noten'),
      h('p', { class: 'sub' }, h('span', { class: 'badge private' }, 'Privat'), ' Nur für dich sichtbar.'),
      h('div', { class: 'tabs' },
        ...[11, 12, 13].map((k) => h('button', {
          class: k === klasse ? 'active' : '',
          onclick: () => { klasse = k; draw(); },
        }, `Klasse ${k}`)),
      ),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' },
          h('div', { class: 'value' }, overall === null ? '–' : isPunkte ? fmt(overall, 1) : fmt(overall, 2)),
          h('div', { class: 'label' }, isPunkte ? 'Ø Punkte (alle Fächer)' : 'Ø Note (alle Fächer)'),
        ),
        isPunkte && overall !== null && h('div', { class: 'stat' },
          h('div', { class: 'value' }, fmt((17 - overall) / 3, 1)),
          h('div', { class: 'label' }, 'entspricht Note ≈'),
        ),
        h('div', { class: 'stat' }, h('div', { class: 'value' }, list.length), h('div', { class: 'label' }, 'Noten eingetragen')),
        h('div', { class: 'stat' }, h('div', { class: 'value' }, subjects.length), h('div', { class: 'label' }, 'Fächer')),
      ),
      h('section', { class: 'card' },
        h('h3', {}, 'Neue Note eintragen'),
        h('form', {
          onsubmit: submitHandler(async (v, form) => {
            const g = await api('/api/grades', { method: 'POST', body: { ...v, klasse } });
            grades.push(g);
            form.reset();
            draw();
          }),
        },
          h('div', { class: 'row' },
            h('label', {}, 'Fach', h('input', { name: 'fach', list: 'faecher', required: true, maxLength: 60 })),
            h('label', {}, 'Art', artSelect),
            h('label', {}, isPunkte ? 'Punkte' : 'Note', wertInput),
          ),
          h('div', { class: 'row' },
            h('label', {}, 'Gewicht', gewichtInput),
            h('label', {}, 'Datum', h('input', { name: 'datum', type: 'date', value: today() })),
            h('label', {}, 'Notiz (optional)', h('input', { name: 'notiz', maxLength: 300 })),
          ),
          h('datalist', { id: 'faecher' }, ...FAECHER.map((f) => h('option', { value: f }))),
          h('p', { class: 'error' }),
          h('button', { type: 'submit' }, 'Speichern'),
        ),
      ),
      h('h2', {}, 'Übersicht'),
      subjects.length === 0
        ? h('p', { class: 'muted' }, `Für Klasse ${klasse} sind noch keine Noten eingetragen.`)
        : h('div', { class: 'grid' }, ...subjects.map((s) => h('section', { class: 'card' },
          h('div', { class: 'subject-head' },
            h('h3', {}, s.fach),
            h('span', { class: 'avg' }, isPunkte ? `Ø ${fmt(s.avg, 1)} P.` : `Ø ${fmt(s.avg, 2)}`),
          ),
          h('div', {}, ...s.gs.map((g) => h('span', {
            class: 'grade-chip',
            title: [ARTEN[g.art]?.label, g.datum && formatDate(g.datum), `Gewicht ${g.gewicht}`, g.notiz].filter(Boolean).join(' · '),
          },
            h('strong', {}, wertLabel(klasse, g.wert)),
            h('span', { class: 'muted small' }, ARTEN[g.art]?.label.split(' ')[0]),
            confirmButton('×', 'Löschen?', async () => {
              await api(`/api/grades/${g.id}`, { method: 'DELETE' });
              grades.splice(grades.indexOf(g), 1);
              draw();
            }, { 'aria-label': 'Note löschen' }),
          ))),
        ))),
      h('p', { class: 'muted small' },
        isPunkte
          ? 'Jahrgangsstufe: 0–15 Punkte. Umrechnung Note ≈ (17 − Punkte) / 3. Das Gewicht legst du je Note fest (Standard: Klausur 2, sonst 1).'
          : 'Einführungsphase: Noten 1–6 mit Tendenzen. Das Gewicht legst du je Note fest (Standard: Klassenarbeit 2, sonst 1).'),
      h('h2', {}, 'Konto'),
      confirmButton('Konto löschen', 'Wirklich alles endgültig löschen?', async () => {
        await api('/api/account', { method: 'DELETE' });
        state.user = null;
        go('/');
      }, { class: 'secondary' }),
    );
  };
  draw();
}

// ---------- Hausaufgaben (Jahrgang) ----------

async function viewHausaufgaben() {
  if (!state.jahrgang) {
    go('/');
    return;
  }
  const items = await api('/api/homework');
  const doneKey = `hw-done-${state.jahrgang.klasse}`;
  const done = new Set(store(doneKey) || []);
  let hideDone = store('hw-hide-done') ?? false;
  let showPast = false;

  const draw = () => {
    const visible = items.filter((i) => {
      if (hideDone && done.has(i.id)) return false;
      if (!showPast && daysUntil(i.faellig) < -7) return false;
      return true;
    });
    const open = items.filter((i) => !done.has(i.id) && daysUntil(i.faellig) >= 0).length;

    app.replaceChildren(
      h('h1', {}, 'Hausaufgabenheft'),
      h('p', { class: 'sub' }, h('span', { class: 'badge' }, state.jahrgang.stufe), ' Für alle im Jahrgang sichtbar.'),
      h('section', { class: 'card' },
        h('h3', {}, 'Hausaufgabe eintragen'),
        h('form', {
          onsubmit: submitHandler(async (v, form) => {
            const hw = await api('/api/homework', { method: 'POST', body: v });
            items.push(hw);
            items.sort((a, b) => a.faellig.localeCompare(b.faellig));
            form.reset();
            draw();
          }),
        },
          h('div', { class: 'row' },
            h('label', {}, 'Fach', h('input', { name: 'fach', list: 'faecher', required: true, maxLength: 60 })),
            h('label', {}, 'Fällig am', h('input', { name: 'faellig', type: 'date', required: true, min: today() })),
          ),
          h('label', {}, 'Aufgabe', h('textarea', { name: 'aufgabe', required: true, maxLength: 1000, placeholder: 'z. B. Buch S. 42, Nr. 3 a–c' })),
          h('datalist', { id: 'faecher' }, ...FAECHER.map((f) => h('option', { value: f }))),
          h('p', { class: 'error' }),
          h('button', { type: 'submit' }, 'Eintragen'),
        ),
      ),
      h('div', { class: 'toolbar' },
        h('h2', {}, `Aufgaben (${open} offen)`),
        h('div', {},
          h('label', { class: 'inline' }, h('input', {
            type: 'checkbox', checked: hideDone,
            onchange: (e) => { hideDone = store('hw-hide-done', e.target.checked); draw(); },
          }), 'Erledigte ausblenden'),
          ' ',
          h('label', { class: 'inline' }, h('input', {
            type: 'checkbox', checked: showPast,
            onchange: (e) => { showPast = e.target.checked; draw(); },
          }), 'Ältere anzeigen'),
        ),
      ),
      visible.length === 0
        ? h('p', { class: 'muted' }, 'Keine Hausaufgaben – genieß die freie Zeit!')
        : h('section', { class: 'card' }, h('ul', { class: 'list' }, ...visible.map((i) => {
          const d = daysUntil(i.faellig);
          const isDone = done.has(i.id);
          const when = d < 0 ? 'überfällig' : d === 0 ? 'heute' : d === 1 ? 'morgen' : `in ${d} Tagen`;
          return h('li', { class: isDone ? 'hw-done' : '' },
            h('input', {
              type: 'checkbox',
              checked: isDone,
              'aria-label': 'Als erledigt markieren',
              onchange: (e) => {
                if (e.target.checked) done.add(i.id);
                else done.delete(i.id);
                store(doneKey, [...done]);
                draw();
              },
            }),
            h('div', { class: 'grow' },
              h('div', {},
                h('strong', {}, i.fach), ' · ',
                h('span', { class: `hw-date ${d < 0 && !isDone ? 'over' : d <= 1 && !isDone ? 'today' : ''}` },
                  `${formatDate(i.faellig)} (${when})`),
              ),
              h('div', {}, i.aufgabe),
              h('div', { class: 'muted small' }, `eingetragen von ${i.autor}`),
            ),
            i.eigene && confirmButton('Löschen', 'Für alle löschen?', async () => {
              await api(`/api/homework/${i.id}`, { method: 'DELETE' });
              items.splice(items.indexOf(i), 1);
              draw();
            }),
          );
        }))),
      h('p', { class: 'muted small' }, 'Der Haken „erledigt“ wird nur auf diesem Gerät gespeichert.'),
    );
  };
  draw();
}

// ---------- Lehrplan & Lernzusammenfassungen (Jahrgang) ----------

async function viewLehrplan() {
  if (!state.jahrgang) {
    go('/');
    return;
  }
  const plan = await api('/api/lehrplan');
  let fachId = store(`lp-fach-${plan.klasse}`);
  if (!plan.faecher.some((f) => f.id === fachId)) fachId = plan.faecher[0]?.id;

  const layout = h('div', { class: 'lp-layout' });
  const notepad = createNotepad(layout);

  const draw = () => {
    store(`lp-fach-${plan.klasse}`, fachId);
    const fach = plan.faecher.find((f) => f.id === fachId);
    layout.replaceChildren(
      h('div', { class: 'lp-main' },
        h('div', { class: 'tabs' }, ...plan.faecher.map((f) => h('button', {
          class: f.id === fachId ? 'active' : '',
          onclick: () => { fachId = f.id; draw(); },
        }, f.name))),
        fach && h('div', {}, ...fach.themen.map((t, idx) => topicCard(t, idx + 1, () => notepad.open(t, fach.name, plan.stufe)))),
      ),
      notepad.panel,
    );
  };

  app.replaceChildren(
    h('h1', {}, 'Lehrplan & Lernzusammenfassungen'),
    h('p', { class: 'sub' }, h('span', { class: 'badge' }, plan.stufe), ' Berufliches Gymnasium Sachsen'),
    h('div', { class: 'hint' },
      'Die Übersicht orientiert sich an den sächsischen Lehrplänen für das Berufliche Gymnasium. Reihenfolge und Schwerpunkte können je nach Schule und Fachrichtung abweichen – im Zweifel gilt, was deine Lehrkraft sagt. Wenn du ein Thema öffnest, erscheint rechts ein Feld für deine eigenen Notizen.'),
    layout,
  );
  draw();
}

function topicCard(t, nr, openNotes) {
  const notesBox = h('div', { class: 'notes' });
  let loaded = false;

  const loadNotes = async () => {
    const notes = await api(`/api/notes?topic=${encodeURIComponent(t.id)}`);
    const list = h('div', {});
    const drawList = () => {
      list.replaceChildren(
        ...(notes.length === 0 ? [h('p', { class: 'muted small' }, 'Noch keine Notizen vom Jahrgang.')] : []),
        ...notes.map((n) => h('div', { class: 'note' },
          h('div', { class: 'note-meta' },
            h('span', {}, `${n.autor} · ${new Date(n.createdAt).toLocaleDateString('de-DE')}`),
            n.eigene && confirmButton('Löschen', 'Wirklich löschen?', async () => {
              await api(`/api/notes/${n.id}`, { method: 'DELETE' });
              notes.splice(notes.indexOf(n), 1);
              drawList();
            }),
          ),
          n.text,
        )),
      );
    };
    drawList();
    notesBox.replaceChildren(
      h('h3', {}, 'Notizen vom Jahrgang'),
      list,
      h('form', {
        onsubmit: submitHandler(async (v, form) => {
          const n = await api('/api/notes', { method: 'POST', body: { topicId: t.id, text: v.text } });
          notes.push(n);
          form.reset();
          drawList();
        }),
      },
        h('textarea', { name: 'text', required: true, maxLength: 3000, placeholder: 'Eselsbrücke, Beispielaufgabe, Ergänzung …' }),
        h('p', { class: 'error' }),
        h('button', { type: 'submit', class: 'secondary' }, 'Mit dem Jahrgang teilen'),
      ),
    );
  };

  return h('details', {
    class: 'topic',
    ontoggle: (e) => {
      if (!e.target.open) return;
      openNotes();
      if (!loaded) {
        loaded = true;
        loadNotes().catch((err) => notesBox.replaceChildren(h('p', { class: 'error' }, err.message)));
      }
    },
  },
    h('summary', {}, `${nr}. ${t.titel}`),
    h('div', { class: 'body' },
      h('div', { class: 'keywords' }, ...t.inhalte.map((k) => h('span', { class: 'badge' }, k))),
      h('div', { class: 'topic-head' },
        h('h3', {}, 'Lernzusammenfassung'),
        h('button', { type: 'button', class: 'secondary small-btn', onclick: openNotes }, 'Eigene Notizen'),
      ),
      h('ul', { class: 'summary-list' }, ...t.zusammenfassung.map((s) => h('li', {}, s))),
      notesBox,
    ),
  );
}

// ---------- Notizfeld rechts (eigene Notizen) ----------

/**
 * Seitliches Notizfeld. Mit Konto werden die Notizen privat im Konto gespeichert,
 * ohne Konto nur auf diesem Gerät.
 */
function createNotepad(layout) {
  let topic = null;
  let context = {};
  let timer = null;
  let dirty = false;

  const title = h('h3', { class: 'notepad-title' });
  const where = h('p', { class: 'muted small notepad-where' });
  const status = h('span', { class: 'muted small', 'aria-live': 'polite' });
  const area = h('textarea', {
    id: 'notepad-text',
    class: 'notepad-text',
    maxLength: 20000,
    placeholder: 'Schreib hier deine eigenen Notizen zu diesem Thema …',
    'aria-label': 'Meine Notizen',
    oninput: () => {
      dirty = true;
      status.textContent = 'Ungespeichert …';
      clearTimeout(timer);
      timer = setTimeout(save, 800);
    },
  });
  const consent = h('div', { class: 'consent', hidden: true, role: 'dialog', 'aria-label': 'Word öffnen erlauben?' });
  const wordBtn = h('button', { type: 'button', onclick: () => askWord() }, 'In Word öffnen');

  const panel = h('aside', { class: 'notepad', hidden: true, 'aria-label': 'Meine Notizen' },
    h('div', { class: 'notepad-head' },
      h('div', {}, h('span', { class: 'eyebrow' }, 'Meine Notizen'), title),
      h('button', { type: 'button', class: 'link', 'aria-label': 'Notizfeld schließen', onclick: () => close() }, '✕'),
    ),
    where,
    area,
    h('div', { class: 'notepad-foot' }, status, wordBtn),
    consent,
  );

  const localKey = () => `notiz-${topic.id}`;

  async function load() {
    area.value = '';
    area.disabled = true;
    status.textContent = 'Lädt …';
    if (state.user) {
      where.textContent = 'Privat in deinem Konto gespeichert – nur du siehst sie.';
      const r = await api(`/api/mynotes?topic=${encodeURIComponent(topic.id)}`);
      area.value = r.text;
    } else {
      where.textContent = 'Nur auf diesem Gerät gespeichert. Melde dich unter „Start“ mit deinem Konto an, um sie überall zu haben.';
      area.value = store(localKey()) || '';
    }
    area.disabled = false;
    status.textContent = area.value ? 'Gespeichert' : '';
  }

  async function save() {
    clearTimeout(timer);
    if (!topic || !dirty) return;
    dirty = false;
    const text = area.value;
    try {
      if (state.user) await api('/api/mynotes', { method: 'POST', body: { topicId: topic.id, text } });
      else store(localKey(), text);
      status.textContent = `Gespeichert ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (err) {
      dirty = true;
      status.textContent = `Nicht gespeichert: ${err.message}`;
    }
  }

  async function open(t, fachName, stufe) {
    if (topic?.id === t.id && !panel.hidden) return;
    await save();
    topic = t;
    context = { fachName, stufe };
    title.textContent = t.titel;
    consent.hidden = true;
    panel.hidden = false;
    layout.classList.add('has-notes');
    try {
      await load();
    } catch (err) {
      area.disabled = false;
      status.textContent = err.message;
    }
  }

  async function close() {
    await save();
    panel.hidden = true;
    layout.classList.remove('has-notes');
  }

  // Erst fragen, dann Word öffnen. Die Erlaubnis kann gemerkt werden.
  function askWord() {
    if (store('word-erlaubt') === true) return exportWord();
    const remember = h('input', { type: 'checkbox', id: 'word-remember' });
    consent.replaceChildren(
      h('strong', {}, 'Word öffnen erlauben?'),
      h('p', { class: 'small' },
        'StayPrep erstellt aus der Lernzusammenfassung und deinen Notizen ein Word-Dokument (.docx) und übergibt es an Word.'),
      h('label', { class: 'inline' }, remember, 'Erlaubnis merken'),
      h('div', { class: 'consent-actions' },
        h('button', {
          type: 'button',
          onclick: () => {
            if (remember.checked) store('word-erlaubt', true);
            consent.hidden = true;
            exportWord();
          },
        }, 'Erlauben und öffnen'),
        h('button', { type: 'button', class: 'secondary', onclick: () => { consent.hidden = true; } }, 'Nicht erlauben'),
      ),
    );
    consent.hidden = false;
  }

  async function exportWord() {
    await save();
    const blob = buildDocx({
      titel: topic.titel,
      unterzeile: [context.fachName, context.stufe, `erstellt am ${new Date().toLocaleDateString('de-DE')}`].filter(Boolean).join(' · '),
      zusammenfassung: topic.zusammenfassung,
      notizen: area.value,
    });
    const name = `${topic.titel.replace(/[\\/:*?"<>|]+/g, '').slice(0, 80)}.docx`;
    try {
      await openFile(blob, name);
      status.textContent = 'Word-Dokument erstellt';
    } catch (err) {
      status.textContent = err.message;
    }
  }

  return { panel, open, close };
}

/** Übergibt eine Datei an das Gerät: auf Handys über „Teilen“ (z. B. an Word), sonst als Download. */
async function openFile(blob, name) {
  if (typeof window.__saveFile === 'function') return window.__saveFile(blob, name);
  const file = new File([blob], name, { type: blob.type });
  const touch = window.matchMedia?.('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name, hidden: true });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ---------- Word-Dokument (.docx) ohne Bibliothek ----------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Minimales ZIP (ohne Kompression) – genug für ein .docx. */
function zipFiles(files, type) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // Dateinamen in UTF-8
    local.setUint16(12, 0x21, true); // Datum 01.01.1980
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, data);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(14, 0x21, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, data.length, true);
    cen.setUint32(24, data.length, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const centralSize = central.reduce((sum, p) => sum + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type });
}

function buildDocx({ titel, unterzeile, zusammenfassung, notizen }) {
  const esc = (s) => String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const run = (text, { bold = false, size = 22, color } = {}) =>
    `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>${bold ? '<w:b/>' : ''}${color ? `<w:color w:val="${color}"/>` : ''}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
  const para = (runs, { after = 120, before = 0, bullet = false } = {}) =>
    `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/>${bullet ? '<w:ind w:left="360" w:hanging="360"/>' : ''}</w:pPr>${runs}</w:p>`;

  const body = [
    para(run(titel, { bold: true, size: 36 }), { after: 60 }),
    para(run(unterzeile, { size: 20, color: '6B5B45' }), { after: 240 }),
    para(run('Lernzusammenfassung', { bold: true, size: 28 }), { before: 120 }),
    ...zusammenfassung.map((z) => para(run(`•  ${z}`), { bullet: true, after: 80 })),
    para(run('Meine Notizen', { bold: true, size: 28 }), { before: 240 }),
    ...(notizen.trim() ? notizen.split('\n') : ['']).map((line) => para(run(line), { after: 80 })),
  ].join('');

  const xmlHead = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return zipFiles([
    {
      name: '[Content_Types].xml',
      text: `${xmlHead}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    },
    {
      name: '_rels/.rels',
      text: `${xmlHead}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      name: 'word/document.xml',
      text: `${xmlHead}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    },
  ], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

// ---------- Start ----------

window.addEventListener('hashchange', router);
refreshMe()
  .catch(() => {})
  .finally(router);
