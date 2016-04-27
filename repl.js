var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')
var sub = require('subleveldown')
var opt = 'replacedbyserver'
var db = multileveldown.client(opt)
var rangeEmitter = require('range-emitter')
var re = rangeEmitter()

function onChange (key, type) {
  console.log('onChange', type, key, typeof key)
  if (re.subscriptionExists(key)) {
    re.publish(key.toString(), type)
  }
}

function onPut (key) { onChange(key, 'put') }
function onDel (key) { onChange(key, 'del') }
function onBatch (ary) {
  ary.forEach(function (item) {
    onChange(item.key, item.type)
  })
}

db.on('put', onPut)
db.on('del', onDel)
db.on('batch', onBatch)

re.subscribe('*', (key, type) => {
  console.log('changed!', key, type)
})

;(function connect () {
  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  var url = `${protocol}://${window.location.host}/repl`
  var ws = websocket(url)
  var reStream = re.connect()
  var remote = db.connect()
  ws.on('error', ws.destroy.bind(ws))
  ws.on('close', function () {
    remote.destroy()
    reStream.destroy()
    setTimeout(connect, 3000)
  })
  ws.on('data', (data) => {
    reStream.write(data)
    remote.write(data)
  })
  remote.on('data', (data) => {
    ws.write(data)
  })
  reStream.on('data', (data) => {
    ws.write(data)
  })
  window.sublevel = (name) => sub(db, name, opt)
  window.db = db
})()
