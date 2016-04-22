var auth = require('./auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var http = require('http')
var db = require('./db')
var options = require('./options')
var routes = require('./routes')

module.exports = create

function create (server, name, opt) {
  opt = options(name, opt)
  if (typeof server === 'number') return create(createServer(server, opt), opt)
  websocket.createServer({ server: server }, handleWs)

  function handleWs (stream) {
    auth(stream.socket.upgradeReq, opt, (error) => {
      if (error) {
        stream.socket.emit('error', error)
      } else {
        var remote = multileveldown.client(options.encoding)
        setTimeout(function () {
          remote.put('test', 10)
        }, 2000)
        stream.pipe(remote.connect()).pipe(stream)
        //stream.pipe(multileveldown.server(db(opt))).pipe(stream)
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
