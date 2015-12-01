# leveldb-mount

leveldb with backend + optional repl built with [subleveldown] and [multileveldown].

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# usage

server.js
```javascript
var leveldb = require('leveldb-mount')
leveldb.server(httpServer)
```

routes.js using [http-hash] (but can use router of choice)
```javascript
var leveldb = require('leveldb-mount')
var routes = leveldb.routes
router.set('/repl.html', routes.html
router.set('/repl.js', routes.js
var db = leveldb.db()
var inbox = leveldb.db().namespace('inbox')
inbox.set...
db.set...
```

repl (optional)

To use the repl you need to have set env variable REPL_CREDENTIALS

browser

navigation to /repl.html
`window.db` and `window.sublevel` will now be set.

[http-hash]: https://github.com/Matt-Esch/http-hash
[subleveldown]: https://github.com/mafintosh/subleveldown
[multileveldown]: https://github.com/mafintosh/multileveldown