var port = 3000;
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var app = express();
 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
 
  console.log('Example app listening at http://%s:%s', host, port);
  var router = require('./app_modules/router')(app);
});
