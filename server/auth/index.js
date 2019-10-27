const express = require('express');

const passport = require('../passport');

const router = express.Router();

router.get(
  '/google',
  (req, res, next) => {
    const referrer = req.get('Referrer');
    if (referrer) {
      req.session.authRedirect = referrer;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile'] })
);

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  const redirect = req.session.authRedirect || '/';
  delete req.session.authRedirect;
  res.redirect(redirect);
});

router.get('/user', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ msg: 'logging you out.' });
  } else {
    res.json({ msg: 'no user to log out!' });
  }
});

module.exports = router;
