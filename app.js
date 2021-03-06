var express = require('express');
var path = require('path');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var settings = require('./setting');

var routes = require('./app/routes/index');
var users = require('./app/routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
//app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html'); //替换文件扩展名ejs为html

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'app', 'favicon.ico')));

app.use(favicon(path.join(__dirname, 'app', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());app
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));

//数据库连接
app.use(session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000
  },
  secret: settings.cookieSecret,
  store: new MongoStore({
    db: settings.db,
    url: settings.url
  })
}));

app.use(function(req, res, next){
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;