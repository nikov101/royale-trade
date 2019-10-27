const http = require('http');
const express = require('express');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet');
const path = require('path');

const dbConnection = require('./db');
const passport = require('./passport');
const io = require('./socket');

const app = express();
const port = process.env.PORT || 8000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: process.env.APP_SECRET || 'default passphrase 201901',
  store: new MongoStore({ mongooseConnection: dbConnection }),
  resave: false,
  saveUninitialized: false
});
app.use(sessionMiddleware);
app.use(helmet());
app.enable('trust proxy');

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./auth'));
app.use('/api/v1', require('./api'));

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

const server = http.createServer(app);
io.attach(server);
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
io.use((socket, next) => passport.initialize()(socket.request, {}, next));
io.use((socket, next) => passport.session()(socket.request, {}, next));

dbConnection.once('open', () => {
  server.listen(port, () => console.log(`Listening on port ${port}`));
});
