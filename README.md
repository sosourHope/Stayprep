# StayPrep

Schul-App für das **berufliche Gymnasium in Baden-Württemberg (Klasse 11–13)**.

| Bereich | Zugang | Wer sieht es? |
|---|---|---|
| **Meine Noten** | Eigenes Konto mit E-Mail + Passwort | Nur du |
| **Hausaufgabenheft** | Jahrgangs-Zugangscode + Name | Alle im selben Jahrgang |
| **Lehrplan & Lernzusammenfassungen** | Jahrgangs-Zugangscode + Name | Alle im selben Jahrgang |

## Funktionen

- **Private Notenverwaltung**
  - Klasse 11 (Eingangsklasse): Noten 1–6 mit Tendenzen (1-, 2+, …)
  - Klasse 12/13 (Jahrgangsstufe 1/2): 0–15 Punkte, Umrechnung in Noten
  - Art der Note (Klausur, Test, mündlich, GFS …) und Gewichtung, Fach- und Gesamtdurchschnitt
  - Konto kann samt aller Daten gelöscht werden
- **Hausaufgabenheft pro Jahrgang**
  - Jede*r im Jahrgang kann Aufgaben eintragen; alle sehen sie
  - Löschen darf nur, wer den Eintrag erstellt hat
  - „Erledigt“-Haken werden persönlich auf dem eigenen Gerät gespeichert
- **Lehrplan pro Jahrgang** mit Lernzusammenfassung zu jedem Thema
  - Fächer: Mathematik, Deutsch, Englisch, Geschichte mit Gemeinschaftskunde, VBL (WG), Informatik/Informationstechnik (TG), Physik, Chemie, Biologie
  - Unter jedem Thema kann der Jahrgang eigene Notizen teilen (Eselsbrücken, Beispiele …)

Die Inhalte orientieren sich an den Bildungsplänen des beruflichen Gymnasiums in
Baden-Württemberg. Reihenfolge und Schwerpunkte können je nach Schule und Profil abweichen.
Die Inhalte liegen in `server/lehrplan.js` und lassen sich dort leicht anpassen oder erweitern.

## Starten

Benötigt nur **Node.js ≥ 20** – keine weiteren Pakete.

```bash
npm start
# → http://localhost:3000
```

Beim ersten Start wird für jeden Jahrgang (11, 12, 13) ein zufälliger **Zugangscode** erzeugt
und **einmalig** in der Konsole ausgegeben. Diesen Code gibst du an den jeweiligen Jahrgang weiter.

Eigene Codes festlegen – entweder per Umgebungsvariable beim Start:

```bash
JAHRGANG_CODE_11=… JAHRGANG_CODE_12=… JAHRGANG_CODE_13=… npm start
```

oder (bei gestopptem Server) per Skript; bestehende Jahrgangs-Anmeldungen werden dabei beendet:

```bash
npm run set-code -- 12 mein-neuer-code
```

### Einstellungen (Umgebungsvariablen)

| Variable | Standard | Bedeutung |
|---|---|---|
| `PORT` | `3000` | Port des Servers |
| `DB_FILE` | `data/db.json` | Speicherort der Daten |
| `COOKIE_SECURE` | – | Auf `1` setzen, wenn die App über HTTPS läuft |
| `JAHRGANG_CODE_11/12/13` | – | Zugangscodes der Jahrgänge |

## Tests

```bash
npm test
```

## Sicherheit

- Passwörter und Jahrgangscodes werden mit **scrypt** + Salt gehasht gespeichert
- Sitzungen über zufällige Tokens in `HttpOnly`/`SameSite=Lax`-Cookies (in der Datenbank nur als SHA-256-Hash)
- Schreibende Anfragen nur mit `Content-Type: application/json` (CSRF-Schutz)
- Begrenzung der Anmeldeversuche pro IP, strenge Content-Security-Policy
- Noten sind strikt pro Konto getrennt, Hausaufgaben/Notizen strikt pro Jahrgang

Für den echten Einsatz die App hinter einem HTTPS-Reverse-Proxy (z. B. Caddy oder nginx) betreiben
und `COOKIE_SECURE=1` setzen.

## Aufbau

```
server/
  index.js      Einstiegspunkt (HTTP-Server)
  app.js        API-Routen, Sitzungen, Validierung, statische Dateien
  auth.js       Passwort-Hashing und Tokens
  db.js         JSON-Dateispeicher (atomares Schreiben)
  lehrplan.js   Lehrplan + Lernzusammenfassungen
public/         Frontend (HTML, CSS, JavaScript ohne Framework)
scripts/        Hilfsskripte (Zugangscode setzen)
test/           API-Tests (node:test)
```
