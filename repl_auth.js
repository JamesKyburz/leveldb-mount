module.exports = replAuth

function replAuth (q, cb) {
  if (!process.env.REPL_CREDENTIALS) throw new Error('REPL_CREDENTIALS not specified')
  if (q.headers.authorization) {
    var sent = new Buffer(q.headers.authorization.slice(6), 'base64').toString()
    if (sent === process.env.REPL_CREDENTIALS) return cb(null)
  }
  cb(new Error('authorisation needed'))
}
