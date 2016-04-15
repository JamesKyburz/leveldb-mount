var replAuth = require('./repl_auth')
var browserify = require('browserify')
var path = require('path')
var options = require('./options')
var replaceStream = require('replacestream')

module.exports = routes

function routes (name, opt) {
  opt = options(name, opt)
  var replaceOptions = { keyEncoding: opt.encoding.keyEncoding, valueEncoding: opt.encoding.valueEncoding, retry: true }
  return {
    html: handleAuth((q, r, params) => r.end('<script src="/repl.js"></script>'), opt),
    js: handleAuth(
      (q, r, params) =>
        browserify({ debug: true })
        .add(path.join(__dirname, '/repl.js'))
        .bundle()
        .pipe(replaceStream('\'replacedbyserver\'', JSON.stringify(replaceOptions)))
        .pipe(r)
      , opt
    )
  }
}

function handleAuth (fn, opt) {
  return (q, r, params, splat) => {
    replAuth(q, opt, (error) => {
      if (error) {
        r.writeHead(401, { 'WWW-Authenticate': 'Basic' })
        r.end(error.message)
      } else {
        fn(q, r, params, splat)
      }
    })
  }
}
