const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  baseAmount: { type: Number, required: true },
  duration: { type: String, required: true },
  description: { type: String, default: '' },
});

module.exports = mongoose.model('Plan', planSchema);