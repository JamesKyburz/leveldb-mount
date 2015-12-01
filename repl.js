var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var opt = { keyEncoding: 'utf8', valueEncoding: 'json' }
var db = multileveldown.client(opt)
var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
var url = `${protocol}://${window.location.host}/repl`
var ws = websocket(url)
ws.pipe(db.connect()).pipe(ws)
window.sublevel = name => sub(db, name, opt)
window.db = db
