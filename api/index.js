const fs = require('fs');
const path = require('path');
const { getUser } = require('./_lib');

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Stillwater</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{height:100%;margin:0}
body{display:grid;place-items:center;background:#15131f;color:#ece8f5;font-family:system-ui,sans-serif}
main{text-align:center;padding:32px;max-width:380px}
.orb{width:120px;height:120px;border-radius:50%;margin:0 auto 24px;background:radial-gradient(circle at 35% 30%,#3d4680,#8c9ae6 80%)}
h1{font-family:Georgia,serif;font-weight:400;font-size:44px;margin:0 0 8px}
p{color:#9b94ad;margin:0 0 28px}
a{display:inline-block;background:#ece8f5;color:#15131f;text-decoration:none;font-weight:600;padding:12px 26px;border-radius:999px}
a:focus-visible{outline:2px solid #8c9ae6;outline-offset:3px}
</style></head>
<body><main><div class="orb"></div><h1>Stillwater</h1>
<p>Sign in to start your session and keep your progress.</p>
<a href="/api/login">Continue with GitHub</a></main></body></html>`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  const user = getUser(req);
  if (!user) return res.end(LOGIN_PAGE);

  const html = fs.readFileSync(path.join(process.cwd(), 'private', 'app.html'), 'utf8');
  const safe = JSON.stringify({ login: user.login, avatar: user.avatar }).replace(/</g, '\\u003c');
  res.end(html.replace('__USER__', () => safe));
};
