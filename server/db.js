import fs from 'node:fs';
import path from 'node:path';

const EMPTY = () => ({
  users: [],
  sessions: [],
  grades: [],
  homework: [],
  notes: [],
  jahrgaenge: {},
});

/**
 * Kleiner JSON-Dateispeicher. Alle Daten liegen im Speicher und werden nach
 * jeder Änderung atomar (tmp-Datei + rename) auf die Platte geschrieben.
 * Ohne `file` bleibt alles nur im Speicher (für Tests).
 */
export function openDb(file) {
  let data = EMPTY();
  if (file && fs.existsSync(file)) {
    data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  }

  function save() {
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
    fs.renameSync(tmp, file);
  }

  return { data, save };
}
