const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeOfferSchema = new Schema({
  playerName: { type: String, required: true },
  playerTag: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  wantCards: { type: [String], required: true },
  offerCards: { type: [String], required: true },
  availableTime: { type: String, required: true },
  preferClan: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  subscriber: { type: [Schema.Types.ObjectId], required: true, ref: 'User' }
});

const TradeOffer = mongoose.model('TradeOffer', tradeOfferSchema);

module.exports = TradeOffer;