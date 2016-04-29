var opt = 'replacedbyserver'
var client = require('client')(opt)
var sub = require('subleveldown')
window.sublevel = (name) => sub(client.db, name, opt)
window.db = client.db
