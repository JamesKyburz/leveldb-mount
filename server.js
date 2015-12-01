var db = require('./db').db
var replAuth = require('./repl_auth')
var websocket = require('websocket-stream')
var multileveldown = require('multileveldown')

module.exports = create

function create (server) {
  websocket.createServer({ server: server }, handleWs)

  function handleWs (stream) {
    replAuth(stream.socket.upgradeReq, (error) => {
      if (error) {
        stream.socket.emit('error', error)
      } else {
        stream.pipe(multileveldown.server(db)).pipe(stream)
      }
    })
  }
}
