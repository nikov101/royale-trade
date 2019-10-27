const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/royaletrade';

mongoose.set('useFindAndModify', false);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', err => {
  console.error('database connection error:', err);
});

module.exports = db;
