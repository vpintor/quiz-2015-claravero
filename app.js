var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var partials = require('express-partials');

var methodOverride = require('method-override');

var session = require('express-session');

//var dialog = require('dialog');

var routes = require('./routes/index');
var creditos = require('./routes/author');

var app = express();

var eo;
var ei;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz Edav'));
app.use(session());

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function(req, res, next) {
  // guardar path en session.redir para despues de login
  if (!req.path.match(/\/login|\/logout/)) {
    req.session.redir = req.path;
  }
  else {
    if (req.session.user && !req.path.match(/\/logout/)) {
      eo = new Date();
      eo = eo.getSeconds() + eo.getMinutes()*60 + eo.getHours()*3600;
      ei = 0;
    }
  }
  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use(function(req, res, next) {
  switch(ei) {
    case 0:
      ei = new Date();
      ei = ei.getSeconds() + ei.getMinutes()*60 + ei.getHours()*3600;
      break;
    default:
      eo = new Date();
      eo = eo.getSeconds() + eo.getMinutes()*60 + eo.getHours()*3600;
      break;
  }

  if (req.session.user && (eo - ei) > 120) {
    req.session.destroy();
    //dialog.info('Sesión cerrada, recargue la página');
  }

  ei = new Date();
  ei = ei.getSeconds() + ei.getMinutes()*60 + ei.getHours()*3600;

  next();
});

app.use('/', routes);
app.use('/author', creditos);

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
            error: {},
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;