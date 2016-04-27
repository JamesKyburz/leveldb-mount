var auth = require('./auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var http = require('http')
var db = require('./db')
var options = require('./options')
var eos = require('end-of-stream')
var routes = require('./routes')
var rangeEmitter = require('range-emitter')

module.exports = create

function create (server, name, opt) {
  opt = options(name, opt)
  if (typeof server === 'number') return create(createServer(server, opt), opt)

  function onChange (re, key, type) {
    if (re.subscriptionExists(key)) {
      re.publish(key.toString(), type)
    }
  }

  var emitters = []

  var dbInstance = db(opt)

  var re = rangeEmitter()

  re.subscribe('*', function (key, type) {
    emitters.forEach(function (e) {
      onChange(e, key, type)
    })
  })

  var reMain = re.connect()

  websocket.createServer({ server: server }, handleWs)

  function handleWs (stream) {
    auth(stream.socket.upgradeReq, opt, (error) => {
      function onPut (key) { onChange(re, key, 'put') }
      function onDel (key) { onChange(re, key, 'del') }
      function onBatch (ary) {
        ary.forEach(function (item) {
          onChange(re, item.key, item.type)
        })
      }

      if (error) {
        stream.socket.emit('error', error)
      } else {
        var local = multileveldown.server(dbInstance)
        var re = rangeEmitter()
        emitters.push(re)
        var reStream = re.connect()

        dbInstance.on('put', onPut)
        dbInstance.on('del', onDel)
        dbInstance.on('batch', onBatch)

        eos(stream, function () {
          dbInstance.removeListener('put', onPut)
          dbInstance.removeListener('del', onDel)
          dbInstance.removeListener('batch', onBatch)
        })

        reStream.on('data', stream.write.bind(stream))
        local.on('data', stream.write.bind(stream))

        stream.on('data', function (data) {
          local.write(data)
          reStream.write(data)
          reMain.write(data)
        })
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
