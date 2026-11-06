import net from 'node:net';
import tls from 'node:tls';
import crypto from 'node:crypto';

/**
 * Liest SMTP-Antworten (auch mehrzeilige wie "250-…" / "250 …") von einem Socket.
 */
function replyReader(socket) {
  let buffer = '';
  let lines = [];
  const ready = [];
  const waiting = [];
  let failure = null;

  const deliver = (reply) => (waiting.length ? waiting.shift().resolve(reply) : ready.push(reply));
  const fail = (err) => {
    failure = err;
    while (waiting.length) waiting.shift().reject(err);
  };

  socket.setEncoding('utf8');
  socket.on('data', (chunk) => {
    buffer += chunk;
    let i;
    while ((i = buffer.indexOf('\r\n')) >= 0) {
      const line = buffer.slice(0, i);
      buffer = buffer.slice(i + 2);
      lines.push(line);
      if (/^\d{3}(?: |$)/.test(line)) {
        deliver({ code: Number(line.slice(0, 3)), text: lines.join('\n') });
        lines = [];
      }
    }
  });
  socket.on('error', fail);
  socket.on('close', () => fail(new Error('SMTP-Verbindung wurde geschlossen.')));

  return () => {
    if (ready.length) return Promise.resolve(ready.shift());
    if (failure) return Promise.reject(failure);
    return new Promise((resolve, reject) => waiting.push({ resolve, reject }));
  };
}

function connect(host, port, secure, timeoutMs, tlsOptions) {
  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host, ...tlsOptions })
      : net.connect({ host, port });
    socket.setTimeout(timeoutMs, () => socket.destroy(new Error('SMTP-Zeitüberschreitung.')));
    socket.once(secure ? 'secureConnect' : 'connect', () => resolve(socket));
    socket.once('error', reject);
  });
}

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const wrap76 = (s) => s.replace(/.{1,76}/g, '$&\r\n');

function buildMessage({ from, to, subject, text }) {
  const domain = from.split('@')[1] || 'localhost';
  return [
    `From: StayPrep <${from}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(text)),
  ].join('\r\n');
}

/**
 * Minimaler SMTP-Versand (Port 465 mit TLS oder 587 mit STARTTLS, AUTH LOGIN).
 * Für lokale Test-Server ohne Verschlüsselung: secure=false, starttls=false.
 */
export function createSmtpMailer({ host, port = 465, user, pass, from, secure = Number(port) === 465, starttls = !secure, timeoutMs = 15000, tlsOptions = {} }) {
  if (!host || !from) throw new Error('SMTP_HOST und MAIL_FROM müssen gesetzt sein.');

  return async function sendMail({ to, subject, text }) {
    if (!/^[^\s@<>]+@[^\s@<>]+$/.test(to)) throw new Error('Ungültige Empfängeradresse.');
    let socket = await connect(host, Number(port), secure, timeoutMs, tlsOptions);
    let read = replyReader(socket);

    const expect = async (codes) => {
      const reply = await read();
      if (!codes.includes(reply.code)) throw new Error(`SMTP-Fehler: ${reply.text}`);
      return reply;
    };
    const cmd = (line, codes) => {
      socket.write(`${line}\r\n`);
      return expect(codes);
    };

    try {
      await expect([220]);
      await cmd(`EHLO ${from.split('@')[1] || 'localhost'}`, [250]);
      if (starttls) {
        await cmd('STARTTLS', [220]);
        socket.removeAllListeners('data');
        socket = await new Promise((resolve, reject) => {
          const s = tls.connect({ socket, servername: host, ...tlsOptions }, () => resolve(s));
          s.once('error', reject);
        });
        read = replyReader(socket);
        await cmd(`EHLO ${from.split('@')[1] || 'localhost'}`, [250]);
      }
      if (user) {
        await cmd('AUTH LOGIN', [334]);
        await cmd(b64(user), [334]);
        await cmd(b64(pass || ''), [235]);
      }
      await cmd(`MAIL FROM:<${from}>`, [250]);
      await cmd(`RCPT TO:<${to}>`, [250, 251]);
      await cmd('DATA', [354]);
      // Zeilen, die mit einem Punkt beginnen, verdoppeln (SMTP-Regel).
      const body = buildMessage({ from, to, subject, text }).replace(/^\./gm, '..');
      await cmd(`${body}\r\n.`, [250]);
      socket.write('QUIT\r\n');
    } finally {
      socket.end();
    }
  };
}

/** Ersatz ohne E-Mail-Server: schreibt die Nachricht in die Konsole (für die Entwicklung). */
export function createConsoleMailer(log = console.log) {
  return async function sendMail({ to, subject, text }) {
    log(`\n--- E-Mail an ${to} (kein SMTP konfiguriert) ---\nBetreff: ${subject}\n\n${text}\n--- Ende ---\n`);
  };
}
