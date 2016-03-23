var mount = require('../')

mount.server(1234, {
  dbPath: 'test',
  replCredentials: 'user:pass',
  encoding: {
    keyEncoding: 'utf8',
    valueEncoding: 'json'
  }
})
