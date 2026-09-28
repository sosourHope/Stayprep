// Setzt den Zugangscode eines Jahrgangs neu.
// Aufruf: npm run set-code -- <11|12|13> <neuer-code>
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../server/db.js';
import { hashSecret } from '../server/auth.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [klasse, code] = process.argv.slice(2);

if (!['11', '12', '13'].includes(klasse) || !code || code.length < 6) {
  console.error('Aufruf: npm run set-code -- <11|12|13> <neuer-code (mind. 6 Zeichen)>');
  process.exit(1);
}

const db = openDb(process.env.DB_FILE || path.join(root, 'data', 'db.json'));
db.data.jahrgaenge[klasse] = { codeHash: await hashSecret(code) };
// Bestehende Jahrgangs-Sitzungen beenden, damit der alte Code nicht weiter gilt.
db.data.sessions = db.data.sessions.filter((s) => !(s.kind === 'jahrgang' && String(s.klasse) === klasse));
db.save();
console.log(`Zugangscode für Klasse ${klasse} gesetzt. Bestehende Jahrgangs-Anmeldungen wurden beendet.`);
