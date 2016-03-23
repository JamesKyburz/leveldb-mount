var level = require('level-party')
var sub = require('subleveldown')
var debug = require('debug')('db')
var options = require('./options')
var dbs = {}

module.exports = create

function create (opt) {
  opt = options(opt)
  if (!opt.dbPath) throw new Error('dbPath not specified')
  if (dbs[opt.dbPath]) return dbs[opt.dbPath].db
  var db = level(opt.dbPath, opt)
  dbs[opt.dbPath] = {
    db: db,
    sublevels: {}
  }
  var sublevels = dbs[opt.dbPath].sublevels
  var add = (namespace) => {
    if (sublevels[namespace]) return sublevels[namespace]
    var value = sub(db, namespace, opt)
    value.on('put', (key, value) => debug(`db:put:${namespace} key: %s value: %j`, key, value))
    value.on('error', (err) => debug(`db:put:${namespace} error: %j`, err))
    sublevels[namespace] = value
    return value
  }
  db.namespace = add
  return db
}
