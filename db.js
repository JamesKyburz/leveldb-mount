var level = require('level-party')
var sub = require('subleveldown')
var debug = require('debug')('db')
var options = require('./options')
var dbs = {}

module.exports = create

function create (name, opt) {
  opt = options(name, opt)
  if (!opt.dbPath) throw new Error('dbPath not specified')
  var encoding = {
    keyEncoding: opt.encoding.keyEncoding,
    valueEncoding: opt.encoding.valueEncoding
  }
  if (dbs[opt.dbPath]) return dbs[opt.dbPath].db
  var db = level(opt.dbPath, encoding)
  dbs[opt.dbPath] = {
    db: db,
    sublevels: {}
  }
  var sublevels = dbs[opt.dbPath].sublevels
  var add = (namespace) => {
    if (sublevels[namespace]) return sublevels[namespace]
    var value = sub(db, namespace, encoding)
    value.on('put', (key, value) => debug(`db:put:${namespace} key: %s value: %j`, key, value))
    value.on('error', (err) => debug(`db:put:${namespace} error: %j`, err))
    value.on('batch', (ary) => debug(`db:batch:${namespace} ary: %j`, ary))
    value.on('del', (key, value) => debug(`db:del:${namespace} key: %s value: %j`, key, value))

    ;['put', 'del'].forEach((event) =>
      value.on(event, (key, changedValue) => db.emit(event, `${value.db.prefix}${key}`, changedValue))
    )

    value.on('batch', (ary) => {
      ary = ary.slice()
      ary.forEach((item) => { item.key = value.db.prefix + item.key })
      db.emit('batch', ary)
    })

    sublevels[namespace] = value
    return value
  }
  db.namespace = add
  return db
}
