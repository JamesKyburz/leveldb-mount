module.exports = options

function options (opt) {
  return Object.assign({
    encoding: {
      keyEncoding: 'utf8',
      valueEncoding: 'json'
    },
    dbPath: '',
    replCredentials: ''
  }, opt || {})
}
