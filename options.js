module.exports = options

function options (name, opt) {
  if (typeof name === 'object') {
    opt = name
    name = ''
  }
  opt = Object.assign({
    encoding: {
      keyEncoding: 'utf8',
      valueEncoding: 'json'
    },
    dbPath: name || '',
    replCredentials: ''
  }, opt || {})
  if (!opt.dbPath && name) opt.dbPath = name
  return opt
}
