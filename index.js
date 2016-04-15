var server = require('./server')
var routes = require('./routes')
var db = require('./db')

module.exports = mount

mount.server = server
mount.db = db
mount.routes = routes

function mount (opt) {
  return {
    server (server, name) {
      return mount.server(server, name, opt)
    },
    db (name) {
      return mount.db(name, opt)
    },
    routes (name) {
      return mount.routes(name, opt)
    }
  }
}
