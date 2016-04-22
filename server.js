var auth = require('./auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var leveldown = require('multileveldown/leveldown')
var http = require('http')
var db = require('./db')
var options = require('./options')
var eos = require('end-of-stream')
var routes = require('./routes')
var EventEmitter = require('events')

module.exports = create

function create (server, name, opt) {
  opt = options(name, opt)
  if (typeof server === 'number') return create(createServer(server, opt), opt)

  var dbInstance = db(opt)
  var changes = onChanges(dbInstance)

  changes.on('change', (key, value) => {
    console.log('change!!!', key, value)
  })

  websocket.createServer({ server: server }, handleWs)

  function handleWs (stream) {
    auth(stream.socket.upgradeReq, opt, (error) => {
      onChanges(dbInstance, changes)
      if (error) {
        stream.socket.emit('error', error)
      } else {
        var remote = multileveldown.client(opt.encoding)
        var local = multileveldown.server(dbInstance)
        var remoteStream = remote.connect()

        function replicate (key, value) { remote.put(key, value) }
        changes.on('change', replicate)
        eos(stream, changes.removeListener.bind(changes, 'change', replicate))
        dbInstance.put('started', new Date())

        remoteStream.on('data', stream.write.bind(stream))
        stream.on('data', remoteStream.write.bind(remoteStream))

        local.on('data', stream.write.bind(stream))
        stream.on('data', local.write.bind(local))
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

function onChanges (db, ee) {
  ee = ee || new EventEmitter()
  if (!db.db._put.hijacked) {
    var put = db.db._put.bind(db.db)
    db.db._put = function (key, value, opt, cb) {
      if (!opt && !cb) cb = function () {}
      function done (cb) {
        return function (err) {
          if (!err) ee.emit('change', key, value)
          cb(err)
        }
      }
      function wrap (opt) {
        if (typeof opt === 'function') opt = done(opt)
        return opt
      }
      put(key, value, wrap(opt), wrap(cb))
    }
    db.db._put.hijacked = true
  }
  return ee
}
