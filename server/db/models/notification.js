const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  read: Boolean,
  tradeOffer: { type: Schema.Types.ObjectId, required: true, ref: 'TradeOffer' },
  createdAt: { type: Date, required: true, default: Date.now },
  users: { type: [Schema.Types.ObjectId], required: true, ref: 'User' },
  lastUser: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;