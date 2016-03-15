var level = require('level-party')
var sub = require('subleveldown')
var debug = require('debug')('db')
var sublevels

if (!process.env.DB_PATH) throw new Error('DB_PATH not specified')

var opt = { keyEncoding: 'utf8', valueEncoding: 'json' }
var db = level(process.env.DB_PATH, opt)

module.exports = create
create.db = db

function create () {
  if (sublevels) return sublevels
  sublevels = {}
  var add = (namespace) => {
    if (sublevels[namespace]) return sublevels[namespace]
    var value = sub(db, namespace, opt)
    value.on('put', (key, value) => debug(`db:put:${namespace} key: %s value: %j`, key, value))
    value.on('error', (err) => debug(`db:put:${namespace} error: %j`, err))
    sublevels[namespace] = value
    return value
  }
  sublevels.namespace = add
  return sublevels
}
