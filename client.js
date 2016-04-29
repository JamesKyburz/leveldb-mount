var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var rangeEmitter = require('level-range-emitter').client
var dbs = {}
var res = {}

module.exports = client

function client (opt) {
  opt = opt || {}
  opt.keyEncoding = opt.keyEncoding || 'utf8'
  opt.valueEncoding = opt.valueEncoding || 'json'
  opt.retry = true
  var cacheKey = opt.keyEncoding + opt.valueEncoding
  var db = dbs[cacheKey]
  var re = res[cacheKey]

  if (!dbs[cacheKey]) {
    db = dbs[cacheKey] = multileveldown.client(opt)
    re = res[cacheKey] = rangeEmitter(db)
    ;(function connect () {
      var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      var url = `${protocol}://${window.location.host}/db`
      var ws = websocket(url)
      var remote = db.connect()
      re.session(remote, ws)
      ws.on('close', window.setTimeout.bind(window, connect, 3000))
    })()
  }

  return {
    db: db,
    emitter: re.emitter
  }
}
