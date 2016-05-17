var http = require('http')
var server = http.createServer()
var leveldb = require('../').server
var spawn = require('child_process').spawn
var concat = require('concat-stream')
var opt = { keyEncoding: 'utf8', valueEncoding: 'json' }

server.on('request', (q, r) => {
  if (q.url === '/') {
    r.setHeader('content-type', 'text/html')
    var ps = spawn('browserify', ['-'])
    ps.stdout.pipe(concat((js) =>
      r.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>${js}</script></body></html>`)
    ))

    ps.stdin.write(`
      var opt = ${JSON.stringify(opt)}
      var client = require('../')(opt)
      window.db = client.db
      client.emitter.subscribe((key, type) => console.log('onchange:%s type:%s', key, type))
    `)
    ps.stdin.end()
    return
  }
  r.end()
})

leveldb(server, Object.assign(opt, { dbPath: 'demo', auth: (q, cb) => cb(null) }))
server.listen(1234)
