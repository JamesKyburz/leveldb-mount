var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var levelup = require('levelup')
var memdown = require('memdown')
var opt = 'replacedbyserver'

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
  var db = multileveldown.server(cacheDb)
  var remoteDb = multileveldown.client(opt)
  remote = remoteDb.connect()
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
