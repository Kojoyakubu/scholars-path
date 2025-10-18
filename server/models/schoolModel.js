// server/models/schoolModel.js
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required.'],
    unique: true,
    trim: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);