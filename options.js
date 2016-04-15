module.exports = options

function options (name, opt) {
  if (typeof name === 'object') {
    opt = name
    name = ''
  }
  return Object.assign({
    encoding: {
      keyEncoding: 'utf8',
      valueEncoding: 'json'
    },
    dbPath: name || '',
    replCredentials: ''
  }, opt || {})
}
