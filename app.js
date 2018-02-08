import express from 'express';
import path from 'path';
// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import lessMiddleware from 'less-middleware';
import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy } from 'passport-local';
import flash from 'connect-flash';
import hbs from 'hbs';

// routes are imported here, note any auth or init middleware are to be placed
// above this line.
import index from './routes/index';
import users from './routes/users';

const app = express();

// export locals ato template
hbs.localsAsTemplateData(app);
app.locals.defaultPageTitle = 'Brims online';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(`${__dirname}/bower_components`));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);

// passport account auth

import Account from './models/account';
passport.use(new Strategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*

hbs.registerHelper('helper_name', function(...) { ... });
hbs.registerPartial('partial_name', 'partial value');
*/
hbs.registerPartials(`${__dirname}/views/partials`, () => {});
// hbs helpers
hbs.registerHelper('link', function(text, options) {
  var attrs = [];

  for (const prop in options.hash) {
    attrs.push(
      `${hbs.handlebars.escapeExpression(prop)}="` +
       `${hbs.handlebars.escapeExpression(options.hash[prop])}"`);
  }

  return new hbs.handlebars.SafeString(
    `<a ${attrs.join(' ')}>${hbs.handlebars.escapeExpression(text)}</a>`
  );
});
module.exports = app;
