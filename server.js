var auth = require('./auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var http = require('http')
var db = require('./db')
var options = require('./options')
var routes = require('./routes')
var rangeEmitter = require('level-range-emitter').server

module.exports = create

function create (server, name, opt) {
  opt = options(name, opt)
  if (typeof server === 'number') return create(createServer(server, opt), opt)

  var dbInstance = db(opt)
  var lre = rangeEmitter(dbInstance)

  websocket.createServer({ server: server }, handleWs)

  return lre.emitter

  function handleWs (stream) {
    auth(stream.socket.upgradeReq, opt, (error) => {
      if (error) {
        stream.destroy()
      } else {
        var dbStream = multileveldown.server(dbInstance)
        lre.session(dbStream, stream)
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
