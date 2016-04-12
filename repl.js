var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var opt = 'replacedbyserver'
var db = multileveldown.client(opt)

;(function connect () {
  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  var url = `${protocol}://${window.location.host}/repl`
  var ws = websocket(url)
  var remote = db.connect()
  ws.on('error', ws.destroy.bind(ws))
  ws.on('close', function () {
    remote.destroy()
    setTimeout(connect, 3000)
  })
  ws.pipe(remote).pipe(ws)
  window.sublevel = (name) => sub(db, name, opt)
  window.db = db
})()
