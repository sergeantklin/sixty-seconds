
var express = require('express');
//var parseurl = require('parseurl');
var session = require('express-session');
var app = express();
app.use(express.static('public')); 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  var router = require('./app_modules/router')(app);
});
