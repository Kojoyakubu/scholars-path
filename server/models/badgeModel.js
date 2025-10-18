// server/models/badgeModel.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required.'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Badge description is required.'],
    trim: true,
  },
  icon: {
    type: String, // Path to an icon image or an emoji
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);