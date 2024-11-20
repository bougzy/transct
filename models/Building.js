const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  investmentPrice: Number,
  returnOnInvestment: Number,
  numberOfRooms: Number,
  numberOfBathrooms: Number,
  image: String,
});

module.exports = mongoose.model('Building', buildingSchema);