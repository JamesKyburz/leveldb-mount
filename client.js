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

  var url = opt.url

  if (!url && typeof window !== 'undefined') {
    var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    url = `${protocol}://${window.location.host}/db`
  }

  var retryTimeout = opt.retry || 3000

  opt.retry = true
  var cacheKey = opt.keyEncoding + opt.valueEncoding + url
  var db = dbs[cacheKey]
  var re = res[cacheKey]
  var close = false
  var ws
  var destroy = function () {
    delete res[cacheKey]
    delete dbs[cacheKey]
    if (ws) ws.destroy()
    close = true
  }

  if (!dbs[cacheKey]) {
    db = dbs[cacheKey] = multileveldown.client(opt)
    re = res[cacheKey] = rangeEmitter(db)
    ;(function connect () {
      if (close) return
      ws = websocket(url)
      var remote = db.connect()
      re.session(remote, ws)
      ws.on('close', setTimeout.bind(null, connect, retryTimeout))
    })()
  }

  return {
    db: db,
    emitter: re.emitter,
    close: destroy
  }
}
