const express = require('express');

const db = require('../db');
const TradeOffer = require('../db/models/tradeoffer');
const Message = require('../db/models/message');
const User = require('../db/models/user');
const io = require('../socket');

const router = express.Router();

// router.post('/search', (req, res) => {
//   TradeOffer.find({
//     offerCards: { $in: req.body.wantCards },
//     wantCards: { $in: req.body.offerCards }
//   })
//     .populate('user')
//     .exec((err, offers) => {
//       if (err) {
//         console.error(err);
//         return res.sendStatus(500);
//       }
//       res.json(offers);
//     });
// });

router.post('/setRead', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  User.findOneAndUpdate(
    { _id: req.user._id },
    { 'notifications.$[offerCond].read': true },
    { arrayFilters: [{ 'offerCond.tradeOffer': req.body.tradeOffer }] },
    (err, doc) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json(doc);
    }
  );
});

router.post('/', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  TradeOffer.findOneAndUpdate(
    { user: req.user._id },
    {
      wantCards: req.body.wantCards,
      offerCards: req.body.offerCards,
      $addToSet: { subscriber: req.user._id },
      availableTime: req.body.availableTime,
      preferClan: req.body.preferClan,
      playerName: req.body.playerName,
      playerTag: req.body.playerTag,
      createdAt: new Date()
    },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json(doc);
    }
  );
});

router.post('/postAdminOffer', (req, res) => {
  const offer = {
    user: req.user._id,
    wantCards: req.body.wantCards,
    offerCards: req.body.offerCards,
    subscriber: [req.user._id],
    availableTime: req.body.availableTime,
    preferClan: req.body.preferClan
  };
  new TradeOffer(offer).save((err, newOffer) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.json(newOffer);
  });
});

router.get('/userOffer', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  TradeOffer.findOne({ user: req.user._id })
    .populate('user')
    .exec((err, doc) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json(doc);
    });
});

router.get('/:id', (req, res) => {
  TradeOffer.findOne({ _id: req.params.id })
    .populate('user')
    .exec((err, doc) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      res.json(doc);
    });
});

router.get('/', async (req, res, next) => {
  try {
    let conditions = {};
    if (req.query.before) {
      conditions.createdAt = { $lt: new Date(req.query.before) };
    }
    if (req.query.wantCards) {
      if (!('$and' in conditions)) {
        conditions.$and = [];
      }
      conditions.$and.push({
        $or: [{ wantCards: { $in: req.query.wantCards } }, { wantCards: [] }]
      });
    }
    if (req.query.offerCards) {
      if (!('$and' in conditions)) {
        conditions.$and = [];
      }
      conditions.$and.push({
        $or: [{ offerCards: { $in: req.query.offerCards } }, { offerCards: [] }]
      });
    }
    const offers = await TradeOffer.find(conditions)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user')
      .exec();
    res.json(offers);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/subscribe', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  TradeOffer.findOneAndUpdate(
    { _id: req.params.id },
    { $addToSet: { subscriber: req.user._id } },
    { new: true }
  ).exec((err, doc) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.json(doc);
  });
});

router.post('/:id/unsubscribe', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  TradeOffer.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { subscriber: req.user._id } },
    { new: true }
  ).exec((err, doc) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.json(doc);
  });
});

router.get('/:id/messages', (req, res) => {
  let conditions = { tradeOffer: req.params.id };
  if (req.query.before) {
    conditions.createdAt = { $lt: new Date(req.query.before) };
  }
  Message.find(conditions)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user')
    .exec((err, messages) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json(messages);
    });
});

router.delete('/:offerId', async (req, res, next) => {
  try {
    const session = await db.startSession();
    await session.withTransaction(async () => {
      await TradeOffer.deleteOne({ _id: req.params.offerId })
        .session(session)
        .exec();
      return await User.updateMany(
        { 'notifications.tradeOffer': req.params.offerId },
        { $pull: { notifications: { tradeOffer: req.params.offerId } } }
      )
        .session(session)
        .exec();
    });
    res.json();
  } catch (err) {
    next(err);
  }
});

router.post('/:id/messages', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  TradeOffer.findById(req.params.id, (err, offer) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    if (!offer) {
      return res.sendStatus(400);
    }

    let message = {
      user: req.user._id,
      tradeOffer: offer._id,
      msg: req.body.msg
    };
    let notification = {
      read: false,
      tradeOffer: offer._id,
      users: [req.user._id],
      lastUser: req.user._id
    };
    let newMessage;

    db.startSession()
      .then(session =>
        session.withTransaction(async () => {
          const msg = await new Message(message).save({ session });
          const msg_1 = await msg.populate('user').execPopulate();
          newMessage = msg_1;
          await User.updateMany(
            {
              _id: { $in: offer.subscriber, $ne: req.user._id },
              'notifications.tradeOffer': { $not: { $eq: offer._id } }
            },
            { $push: { notifications: notification } }
          )
            .session(session)
            .exec();
          await User.updateMany(
            { _id: { $in: offer.subscriber, $ne: req.user._id } },
            {
              $addToSet: { 'notifications.$[offerCond].users': req.user._id },
              'notifications.$[offerCond].lastUser': req.user._id,
              'notifications.$[offerCond].read': false,
              'notifications.$[offerCond].createdAt': msg.createdAt
            },
            { arrayFilters: [{ 'offerCond.tradeOffer': offer._id }] }
          )
            .session(session)
            .exec();
          await User.updateMany(
            { _id: { $in: offer.subscriber, $ne: req.user._id } },
            {
              $push: { notifications: { $each: [], $sort: { createdAt: -1 } } }
            }
          )
            .session(session)
            .exec();
          return await offer
            .updateOne({ $addToSet: { subscriber: [req.user._id] } })
            .session(session)
            .exec();
        })
      )
      .then(() => {
        io.to(newMessage.tradeOffer).emit('message', newMessage);
        offer.subscriber.forEach(uid => {
          if (uid.toString() !== req.user._id.toString()) {
            io.to(uid).emit('notification');
          }
        });
        res.json(newMessage);
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  });
});

module.exports = router;
