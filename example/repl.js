var mount = require('../')

mount.server(1234, 'test', {
  replCredentials: 'user:pass',
  encoding: {
    keyEncoding: 'utf8',
    valueEncoding: 'json'
  }
})
