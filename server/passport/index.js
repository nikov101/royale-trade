const passport = require('passport');

const GoogleStrategy = require('./googleStrategy');
const User = require('../db/models/user');

passport.serializeUser((user, done) => {
  done(null, { _id: user._id });
});

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    done(null, user);
  })
});

passport.use(GoogleStrategy);

module.exports = passport;