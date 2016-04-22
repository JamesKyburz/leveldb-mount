var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var memdown = require('memdown')
var opt = 'replacedbyserver'

;(function connect () {
  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  var url = `${protocol}://${window.location.host}/repl`
  var ws = websocket(url)
  var localDb = memdown(opt)
  var db = multileveldown.server({
    isOpen: () => true,
    isClosed: () => false,
    db: localDb
  })
  ws.on('error', ws.destroy.bind(ws))
  ws.on('close', function () {
    db.destroy()
    setTimeout(connect, 3000)
  })
  ws.pipe(db).pipe(ws)
  window.db = localDb
})()
