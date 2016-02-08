var replAuth = require('./repl_auth')
var browserify = require('browserify')
var path = require('path')

module.exports = routes

function routes () {
  return {
    html: handleAuth((q, r, params) => r.end('<script src="/repl.js/"></script>')),
    js: handleAuth((q, r, params) => browserify({ debug: true }).add(path.join(__dirname, '/repl.js/')).bundle().pipe(r))
  }
}

function handleAuth (fn) {
  return (q, r, params, splat) => {
    replAuth(q, (error) => {
      if (error) {
        r.writeHead(401, { 'WWW-Authenticate': 'Basic' })
        r.end(error.message)
      } else {
        fn(q, r, params, splat)
      }
    })
  }
}
