const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  tradeOffer: { type: Schema.Types.ObjectId, required: true, ref: 'TradeOffer' },
  msg: { type: String },
  createdAt: { type: Date, required: true, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;