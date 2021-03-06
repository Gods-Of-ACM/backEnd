'use strict';
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const passport = require('passport');
require('./passport')(passport);
const experiment = require('./routes/expirement');
const target = require('./routes/target');
const user = require('./routes/user');
const citation = require('./routes/citation');

const env = process.env.NODE_ENV || 'development';

// Create the server for the API to run on
const app = express();

// View engine configs
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware for the API server
app.use(morgan('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(passport.initialize());

// Set the header to allow cross site so that this server may act as an API
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization');
  next();
});

// Testing route to ensure server is up
app.get('/', (req, res) => {
  res.json({
    'Welcome to the CSC 424 API': '',
    'uptime': `${process.uptime()}`,
  });
});

// when we get ready to authenticate we can use this guy
// const authenticate = passport.authenticate('jwt', {session: false});
app.use('/experiment', experiment);
app.use('/citation', citation);
app.use('/target', target);
app.use('/user', user);

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {},
  });
});

// Creating a section for dev configs and prod configs
if (env === 'development') {
  app.listen(config.devPort, () => {
    console.log(`API server started at http://localhost:${config.devPort}`);
  });
} else {
  app.listen(config.prodPort, () => {
    console.log(`API server started at http://localhost:${config.prodPort}`);
  });
}
