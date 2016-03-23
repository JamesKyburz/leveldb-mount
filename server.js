var replAuth = require('./repl_auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var http = require('http')
var db = require('./db')
var options = require('./options')
var routes = require('./routes')

module.exports = create

function create (server, opt) {
  opt = options(opt)
  if (typeof server === 'number') return create(createServer(server, opt), opt)
  websocket.createServer({ server: server }, handleWs)

  function handleWs (stream) {
    replAuth(stream.socket.upgradeReq, opt, (error) => {
      if (error) {
        stream.socket.emit('error', error)
      } else {
        stream.pipe(multileveldown.server(db(opt))).pipe(stream)
      }
    })
  }
}

function createServer (port, opt) {
  var server = http.createServer()
  var replRoutes = routes(opt)
  server.listen(port)
  if (opt.replCredentials) {
    server.on('request', (q, r) => {
      if (q.url === '/repl.html') return replRoutes.html(q, r)
      if (q.url === '/repl.js') return replRoutes.js(q, r)
      r.end()
    })
  }
  return server
}
