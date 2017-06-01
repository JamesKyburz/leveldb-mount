var options = require('./options')
module.exports = auth

function auth (q, opt, cb) {
  opt = options(opt)
  if (opt.auth) return opt.auth(q, cb)
  if (!opt.replCredentials) cb(new Error('authorisation needed'))
  if (q.headers.authorization) {
    var sent = Buffer.from(q.headers.authorization.slice(6), 'base64').toString()
    if (sent === opt.replCredentials) return cb(null)
  }
  cb(new Error('authorisation needed'))
}
