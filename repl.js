var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var levelup = require('levelup')
var memdown = require('memdown')
var opt = 'replacedbyserver'
var EventEmitter = require('events')

;(function connect () {
  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  var url = `${protocol}://${window.location.host}/repl`
  var ws = websocket(url)
  var localDb = memdown(opt)
  var cacheDb = levelup('cachedb', {
    keyEncoding: opt.keyEncoding,
    valueEncoding: opt.valueEncoding,
    db: memdown
  })

  var changes = onChanges(cacheDb)
  changes.on('change', (key, value) => {
    console.log('change! %s:%s', key, JSON.stringify(value))
  })
  setInterval(function () {
    onChanges(cacheDb, changes)
  }, 1000)

  cacheDb.put('testing', 100)

  var db = multileveldown.server(cacheDb)
  var remoteDb = multileveldown.client(opt)
  var remote = remoteDb.connect()
  ws.on('error', ws.destroy.bind(ws))
  ws.on('close', function () {
    db.destroy()
    remote.destroy()
    setTimeout(connect, 3000)
  })
  ws.on('data', db.write.bind(db))
  db.on('data', ws.write.bind(ws))

  ws.on('data', remote.write.bind(remote))
  remote.on('data', ws.write.bind(ws))
  window.db = cacheDb
  window.remote = remoteDb
})()

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
