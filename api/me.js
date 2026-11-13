const { getUser } = require('./_lib');

module.exports = (req, res) => {
  const u = getUser(req);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = u ? 200 : 401;
  res.end(JSON.stringify(u ? { login: u.login, avatar: u.avatar } : { error: 'signed_out' }));
};
