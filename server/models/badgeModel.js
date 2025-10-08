const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Path to an icon image or an emoji
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);