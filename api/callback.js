const { cookies, setCookie, sign, baseUrl, SESSION_DAYS } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const { code, state } = req.query;
    const saved = cookies(req).sw_state;
    if (!code || !state || !saved || state !== saved) {
      res.statusCode = 400;
      return res.end('Sign-in failed: invalid state. Go back and try again.');
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: baseUrl(req) + '/api/callback',
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) {
      res.statusCode = 401;
      return res.end('Sign-in failed: GitHub did not return a token.');
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'stillwater-app',
      },
    });
    const gh = await userRes.json();
    if (!gh.login) {
      res.statusCode = 401;
      return res.end('Sign-in failed: could not read your GitHub profile.');
    }

    // Optional allowlist: ALLOWED_USERS="alice,bob"
    const allowed = (process.env.ALLOWED_USERS || '')
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(gh.login.toLowerCase())) {
      res.statusCode = 403;
      return res.end('This account is not on the allowed list.');
    }

    const maxAge = SESSION_DAYS * 86400;
    const session = sign({
      u: { id: gh.id, login: gh.login, avatar: gh.avatar_url },
      exp: Date.now() + maxAge * 1000,
    });
    res.setHeader('Set-Cookie', [
      setCookie('sw_session', session, maxAge),
      setCookie('sw_state', '', 0),
    ]);
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.end('Sign-in failed. Check the server logs.');
  }
};
