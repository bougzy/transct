const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  profits: { type: Number, required: true, default: 0 },
  profitsPaused: { type: Boolean, default: false },
  notifications: [{ message: String, date: { type: Date, default: Date.now } }],
  currentPlan: { type: String, default: null },
  blocked: { type: Boolean, default: false },
  referralLink: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  referralCount: { type: Number, default: 0 },
  approved: { type: Boolean, default: false } 
});

module.exports = mongoose.model('User', userSchema);