const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || '';
const SESSION_DAYS = 7;

function mac(body) {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body + '.' + mac(body);
}

function verify(token) {
  if (!token || !SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function setCookie(name, value, maxAgeSec) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

function getUser(req) {
  const p = verify(cookies(req).sw_session);
  return p && p.u ? p.u : null;
}

function baseUrl(req) {
  return process.env.BASE_URL || `https://${req.headers.host}`;
}

module.exports = { sign, verify, cookies, setCookie, getUser, baseUrl, SESSION_DAYS };
