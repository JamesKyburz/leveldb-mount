# leveldb-mount

leveldb with backend + optional repl built with [subleveldown] and [multileveldown].

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# server

server.js
```javascript
var leveldb = require('leveldb-mount')
leveldb.server(httpServer, opt) // see options
```

`server+repl`
```javascript
var leveldb = require('leveldb-mount')
leveldb.server(port, opt) // see options
```

Note if no credentials are given the repl is not available.

# routes
routes.js using [http-hash] (but can use router of choice)
```javascript
var leveldb = require('leveldb-mount')
var routes = leveldb.routes(opt) // see options
router.set('/repl.html', routes.html)
router.set('/repl.js', routes.js)
```

# db
```javascript
var db = leveldb.db(opt) // see options
var inbox = db.namespace('inbox')
inbox.set...
db.set...
```

# optional repl
navigation to /repl.html and `window.db` and `window.sublevel` will now be set.

# options
```javascript
var opt = {
  dbPath: 'path',
  replCredentials: 'user:pass',
  encoding: {
    keyEncoding: 'utf8',
    valueEncoding: 'json'
  }
}
```

* `opt.replCredentials` is only needed if you want the repl.
* `opt.encoding` defaults to `utf8` for keys and `json` for values.
* `opt.dbPath` has to contain a value.
* `opt.auth` optional auth function (request, cb).

`encoding` is passed to the repl!

# example
```
node example/index.js
```

[http-hash]: https://github.com/Matt-Esch/http-hash
[subleveldown]: https://github.com/mafintosh/subleveldown
[multileveldown]: https://github.com/mafintosh/multileveldown
