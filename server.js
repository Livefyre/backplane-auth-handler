/**
 * @fileoverview Simple http server for server fake json requests, static file serving,and other
 * mockery.
 */
var PORT = 8090;
var express = require('express');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var app = express();
var fs = require('fs');
var fixturePath = __dirname + '/test/fixtures';

function getFixtureObj(name, callback) {
  fs.readFile(fixturePath + '/' + name + '.json', 'utf8', function (err, data) {
    if (err) {
      throw err;
    }
    callback(JSON.parse(data));
  });
}

app.get('/echo/jsonp/', function(req, res){
  if (req.query.data) {
    res.jsonp(req.query.data);
  }
});

app.get('/api/v3.0/auth/', function(req, res) {
  getFixtureObj('auth', function(data) {
    res.jsonp({
      data: data,
      code: 200
    });
  });
});

app.use(serveIndex(__dirname));
app.use(serveStatic(__dirname));

console.log('starting server at port', PORT);
app.listen(PORT);
