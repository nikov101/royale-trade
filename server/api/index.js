const express = require('express');

const router = express.Router();

const User = require('../db/models/user');
const TradeOffer = require('../db/models/tradeoffer');

router.use('/tradeoffers', require('./tradeoffer'));

router.get('/userData', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const doc = await User.findOne({ _id: req.user._id })
      .populate('notifications.lastUser', ['name', 'photo'])
      .populate({
        path: 'notifications.tradeOffer',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .exec();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.get('/subscription', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  let conditions = { subscriber: req.user._id };
  if (req.query.before) {
    conditions.createdAt = { $lt: new Date(req.query.before) };
  }
  TradeOffer.find(conditions)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('user')
    .exec((err, offers) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json(offers);
    });
});

module.exports = router;
