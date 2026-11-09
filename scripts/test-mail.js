// Schickt eine Test-Mail mit den aktuellen Einstellungen.
// Aufruf: npm run test-mail -- deine@adresse.de
import { mailerFromEnv } from '../server/mail.js';

const to = process.argv[2];
if (!to || !to.includes('@')) {
  console.error('Aufruf: npm run test-mail -- deine@adresse.de');
  process.exit(1);
}
const mailer = mailerFromEnv();
if (!mailer.kind) console.log('Hinweis: Kein Mailversand eingerichtet – die Mail erscheint nur hier.');
try {
  await mailer.sendMail({ to, subject: 'StayPrep: Test-Mail', text: 'Hallo,\n\nder E-Mail-Versand von StayPrep funktioniert.\n\nDein StayPrep' });
  console.log(`Test-Mail an ${to} verschickt${mailer.kind ? ` (über ${mailer.kind})` : ''}.`);
} catch (err) {
  console.error('Versand fehlgeschlagen:', err.message);
  process.exit(1);
}
