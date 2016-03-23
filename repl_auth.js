var options = require('./options')
module.exports = replAuth

function replAuth (q, opt, cb) {
  opt = options(opt)
  if (!opt.replCredentials) cb(new Error('authorisation needed'))
  if (q.headers.authorization) {
    var sent = new Buffer(q.headers.authorization.slice(6), 'base64').toString()
    if (sent === opt.replCredentials) return cb(null)
  }
  cb(new Error('authorisation needed'))
}
