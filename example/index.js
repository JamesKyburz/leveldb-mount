var mount = require('../')

mount.server(1234, 'test', {
  replCredentials: 'user:pass',
  keyEncoding: 'utf8',
  valueEncoding: 'json'
})
