// StayPrep – Frontend (ohne Framework). Alle Nutzereingaben werden über
// textContent eingefügt, nie als HTML.

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const state = { user: null, jahrgang: null };

const FAECHER = [
  'Deutsch', 'Mathematik', 'Englisch', 'Geschichte mit Gemeinschaftskunde', 'Religion / Ethik', 'Sport',
  'Physik', 'Chemie', 'Biologie', 'Informatik', 'Volks- und Betriebswirtschaftslehre', 'Wirtschaftslehre',
  'Französisch', 'Spanisch', 'Profilfach', 'Computertechnik',
];

const ARTEN = {
  klausur: { label: 'Klassenarbeit / Klausur', gewicht: 2 },
  test: { label: 'Test', gewicht: 1 },
  muendlich: { label: 'Mündlich', gewicht: 1 },
  gfs: { label: 'GFS / Präsentation', gewicht: 1 },
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

function renderNav() {
  const route = location.hash.replace(/^#/, '') || '/';
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
  const route = location.hash.replace(/^#/, '') || '/';
  const view = views[route] || viewHome;
  renderNav();
  app.replaceChildren(h('p', { class: 'muted' }, 'Lädt …'));
  try {
    await view();
  } catch (err) {
    if (err.status === 401) {
      await refreshMe();
      location.hash = '#/';
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
        h('button', { onclick: () => (location.hash = '#/noten') }, 'Zu meinen Noten'),
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
  const card = h('section', { class: 'card' });
  const draw = () => {
    const isLogin = mode === 'login';
    card.replaceChildren(
      h('span', { class: 'badge private' }, 'Privat'),
      h('h2', {}, isLogin ? 'Anmelden – Meine Noten' : 'Konto erstellen'),
      h('p', { class: 'muted small' }, 'Dein privater Bereich mit E-Mail und Passwort. Nur du siehst deine Noten.'),
      h('form', {
        onsubmit: submitHandler(async (v) => {
          const res = await api(isLogin ? '/api/login' : '/api/register', { method: 'POST', body: v });
          state.user = res.user;
          location.hash = '#/noten';
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
      h('button', {
        class: 'link',
        onclick: () => {
          mode = isLogin ? 'register' : 'login';
          draw();
        },
      }, isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Schon ein Konto? Anmelden'),
    );
  };
  draw();
  return card;
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
        h('button', { onclick: () => (location.hash = '#/hausaufgaben') }, 'Hausaufgaben'),
        h('button', { onclick: () => (location.hash = '#/lehrplan') }, 'Lehrplan'),
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
        location.hash = '#/hausaufgaben';
      }),
    },
      h('label', {}, 'Klasse',
        h('select', { name: 'klasse', required: true },
          h('option', { value: '11' }, 'Klasse 11 – Eingangsklasse'),
          h('option', { value: '12' }, 'Klasse 12 – Jahrgangsstufe 1'),
          h('option', { value: '13' }, 'Klasse 13 – Jahrgangsstufe 2'),
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
    location.hash = '#/';
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
            h('button', {
              class: 'link',
              'aria-label': 'Note löschen',
              onclick: async () => {
                if (!confirm('Diese Note löschen?')) return;
                await api(`/api/grades/${g.id}`, { method: 'DELETE' });
                grades.splice(grades.indexOf(g), 1);
                draw();
              },
            }, '×'),
          ))),
        ))),
      h('p', { class: 'muted small' },
        isPunkte
          ? 'Jahrgangsstufe: 0–15 Punkte. Umrechnung Note ≈ (17 − Punkte) / 3. Das Gewicht legst du je Note fest (Standard: Klausur 2, sonst 1).'
          : 'Eingangsklasse: Noten 1–6 mit Tendenzen. Das Gewicht legst du je Note fest (Standard: Klassenarbeit 2, sonst 1).'),
      h('h2', {}, 'Konto'),
      h('button', {
        class: 'secondary',
        onclick: async () => {
          if (!confirm('Konto und alle Noten endgültig löschen?')) return;
          await api('/api/account', { method: 'DELETE' });
          state.user = null;
          location.hash = '#/';
        },
      }, 'Konto löschen'),
    );
  };
  draw();
}

// ---------- Hausaufgaben (Jahrgang) ----------

async function viewHausaufgaben() {
  if (!state.jahrgang) {
    location.hash = '#/';
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
            i.eigene && h('button', {
              class: 'link',
              onclick: async () => {
                if (!confirm('Eintrag für alle löschen?')) return;
                await api(`/api/homework/${i.id}`, { method: 'DELETE' });
                items.splice(items.indexOf(i), 1);
                draw();
              },
            }, 'Löschen'),
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
    location.hash = '#/';
    return;
  }
  const plan = await api('/api/lehrplan');
  let fachId = store(`lp-fach-${plan.klasse}`);
  if (!plan.faecher.some((f) => f.id === fachId)) fachId = plan.faecher[0]?.id;

  const draw = () => {
    store(`lp-fach-${plan.klasse}`, fachId);
    const fach = plan.faecher.find((f) => f.id === fachId);
    app.replaceChildren(
      h('h1', {}, 'Lehrplan & Lernzusammenfassungen'),
      h('p', { class: 'sub' }, h('span', { class: 'badge' }, plan.stufe), ' Berufliches Gymnasium Baden-Württemberg'),
      h('div', { class: 'hint' },
        'Die Übersicht orientiert sich an den Bildungsplänen des beruflichen Gymnasiums. Reihenfolge und Schwerpunkte können je nach Schule und Profil abweichen – im Zweifel gilt, was deine Lehrkraft sagt. Unter jedem Thema könnt ihr eigene Notizen für den Jahrgang ergänzen.'),
      h('div', { class: 'tabs' }, ...plan.faecher.map((f) => h('button', {
        class: f.id === fachId ? 'active' : '',
        onclick: () => { fachId = f.id; draw(); },
      }, f.name))),
      fach && h('div', {}, ...fach.themen.map((t, idx) => topicCard(t, idx + 1))),
    );
  };
  draw();
}

function topicCard(t, nr) {
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
            n.eigene && h('button', {
              class: 'link',
              onclick: async () => {
                if (!confirm('Notiz löschen?')) return;
                await api(`/api/notes/${n.id}`, { method: 'DELETE' });
                notes.splice(notes.indexOf(n), 1);
                drawList();
              },
            }, 'Löschen'),
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
        h('button', { type: 'submit', class: 'secondary' }, 'Notiz teilen'),
      ),
    );
  };

  return h('details', {
    class: 'topic',
    ontoggle: (e) => {
      if (e.target.open && !loaded) {
        loaded = true;
        loadNotes().catch((err) => notesBox.replaceChildren(h('p', { class: 'error' }, err.message)));
      }
    },
  },
    h('summary', {}, `${nr}. ${t.titel}`),
    h('div', { class: 'body' },
      h('div', { class: 'keywords' }, ...t.inhalte.map((k) => h('span', { class: 'badge' }, k))),
      h('h3', {}, 'Lernzusammenfassung'),
      h('ul', { class: 'summary-list' }, ...t.zusammenfassung.map((s) => h('li', {}, s))),
      notesBox,
    ),
  );
}

// ---------- Start ----------

window.addEventListener('hashchange', router);
refreshMe()
  .catch(() => {})
  .finally(router);
