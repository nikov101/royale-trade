const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../db/models/user');

const strategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (token, tokenSecret, profile, done) => {
  const { id, displayName, photos } = profile;

  User.findOneAndUpdate({ 'google.id': id }, {
    name: displayName,
    photo: photos[0].value
  }, {
    new: true,
    upsert: true
  }, (err, user) => {
    if (err) {
      console.log(err);
      return done(null, false)
    }
    return done(null, user);
  });

  // User.findOne({ 'google.id': id }, (err, user) => {
  //   if (err) {
  //     console.error(err);
  //     return done(null, false);
  //   }
  //   if (user) {
  //     return done(null, user);
  //   } else {
  //     const newUser = new User({
  //       google: { id },
  //       name: displayName,
  //       photo: photos[0].value
  //     });
  //     newUser.save((err, savedUser) => {
  //       if (err) {
  //         console.error(err);
  //         return done(null, false);
  //       }
  //       return done(null, savedUser);
  //     });
  //   }
  // });
});

module.exports = strategy;