const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  google: {
    id: { type: String, unique: true, select: false, required: true }
  },
  subscription: { type: Schema.Types.ObjectId, ref: 'TradeOffer' },
  admin: Boolean,
  photo: String,
  notifications: [
    {
      read: Boolean,
      tradeOffer: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'TradeOffer'
      },
      createdAt: { type: Date, required: true, default: Date.now },
      users: { type: [Schema.Types.ObjectId], required: true, ref: 'User' },
      lastUser: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
