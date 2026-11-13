const crypto = require('crypto');
const { setCookie, baseUrl } = require('./_lib');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', baseUrl(req) + '/api/callback');
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  res.setHeader('Set-Cookie', setCookie('sw_state', state, 600));
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
};
