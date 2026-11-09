# StayPrep online stellen

Damit Konten, Noten, Hausaufgaben und Notizen **dauerhaft gespeichert** werden und **echte E-Mails**
(Passwort zurücksetzen, Anmeldelink) ankommen, läuft StayPrep auf einem Server im Internet.
Diese Anleitung nutzt **Render** (Server in Frankfurt) und **Gmail** zum Versenden.

Kosten: Render „Starter“ etwa 7 US-$ im Monat plus etwa 0,25 US-$ für 1 GB Speicher. Das feste Laufwerk,
auf dem die Daten liegen, gibt es bei Render nur in bezahlten Tarifen; im kostenlosen Tarif wären die
Daten nach jedem Neustart weg. Aktuelle Preise: render.com/pricing.

---

## 1. E-Mail-Konto zum Versenden vorbereiten (Gmail)

Am besten ein eigenes Gmail-Konto nur für StayPrep anlegen, z. B. `stayprep.meineschule@gmail.com`.

1. Im Google-Konto die **Bestätigung in zwei Schritten** einschalten (myaccount.google.com → Sicherheit).
2. Unter **myaccount.google.com/apppasswords** ein **App-Passwort** erstellen (Name z. B. „StayPrep“).
3. Das 16-stellige App-Passwort notieren (ohne Leerzeichen). Es wird gleich als `SMTP_PASS` gebraucht.

> **Alternative Brevo:** Falls der Gmail-Versand nicht klappt (manche Hoster sperren den Mailversand
> per SMTP), auf brevo.com ein kostenloses Konto anlegen (300 Mails/Tag), unter „Senders“ die
> Absenderadresse bestätigen und unter „SMTP & API → API Keys“ einen Schlüssel erstellen.
> Dann bei Render `BREVO_API_KEY` und `MAIL_FROM` ausfüllen – die SMTP-Felder werden dann ignoriert.

## 2. Code auf den Hauptzweig bringen

Render baut die App aus dem Hauptzweig (`main`) des Repositorys `sosourHope/Stayprep`.
Dazu den Pull Request mit den StayPrep-Änderungen auf GitHub **mergen**.

## 3. App bei Render anlegen

1. Auf **render.com** mit dem GitHub-Konto anmelden.
2. **New → Blueprint** wählen und das Repository **sosourHope/Stayprep** auswählen.
   Render liest die Datei `render.yaml` und schlägt den Dienst „stayprep“ mit Laufwerk vor.
3. Die abgefragten Werte eintragen:

   | Feld | Was eintragen |
   |---|---|
   | `SMTP_USER` | die Gmail-Adresse aus Schritt 1 |
   | `SMTP_PASS` | das App-Passwort aus Schritt 1 |
   | `MAIL_FROM` | die Gmail-Adresse aus Schritt 1 (oder bei Brevo die bestätigte Absenderadresse) |
   | `BREVO_API_KEY` | leer lassen (nur bei Brevo ausfüllen) |
   | `JAHRGANG_CODE_11` / `_12` / `_13` | selbst ausgedachte Zugangscodes für die Jahrgangsbereiche (mind. 6 Zeichen) |

4. **Apply** klicken. Nach ein paar Minuten läuft die App unter einer Adresse wie
   `https://stayprep-xxxx.onrender.com`. Die Links in den E-Mails zeigen automatisch auf diese Adresse.

## 4. Testen

1. Die Adresse öffnen, ein Konto registrieren und eine Note eintragen.
2. Abmelden, dann **„Passwort vergessen?“** oder **„Anmeldelink per E-Mail“** wählen – die Mail sollte
   nach wenigen Sekunden ankommen (auch im Spam-Ordner nachsehen).
3. Kommt keine Mail an: Bei Render im Dienst **Logs** öffnen. Dort steht beim Start, über welchen Weg
   Mails verschickt werden, und bei Problemen die Fehlermeldung. Unter **Shell** kann man mit
   `npm run test-mail -- deine@adresse.de` eine Test-Mail schicken.
4. Nach einem **Manual Deploy** (Neustart) prüfen, dass die Note noch da ist – dann liegen die Daten
   richtig auf dem Laufwerk.

## Gut zu wissen

- **Updates:** Jede Änderung auf `main` wird automatisch neu veröffentlicht. Die Daten auf dem
  Laufwerk bleiben dabei erhalten.
- **Sicherung:** Die Daten liegen in einer Datei (`/var/data/db.json`). Über die Render-Shell lässt sie
  sich ansehen; zusätzlich legt Render von Laufwerken regelmäßig Sicherungen (Snapshots) an.
- **Datenschutz:** Es geht um Daten von Schülerinnen und Schülern. Der Server steht in Frankfurt. Vor
  dem Einsatz an der Schule am besten mit der Schule bzw. dem Datenschutzbeauftragten klären, ob die
  Nutzung so in Ordnung ist.
- **Eigene Adresse:** Unter Settings → Custom Domains lässt sich z. B. `stayprep.meine-schule.de`
  verbinden. Dann zusätzlich die Variable `APP_URL` auf diese Adresse setzen.

## Andere Hoster

Mit dem `Dockerfile` läuft StayPrep auch bei Railway, Fly.io oder auf einem eigenen Server. Wichtig ist
immer ein **dauerhaftes Laufwerk (Volume) unter `/data`** und die Mail-Einstellungen wie oben
(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` oder `BREVO_API_KEY`, `MAIL_FROM`).
Ohne bekannte Hoster-Adresse zusätzlich `APP_URL` setzen.
