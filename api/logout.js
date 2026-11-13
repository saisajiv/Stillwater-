const { setCookie } = require('./_lib');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', setCookie('sw_session', '', 0));
  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
};
