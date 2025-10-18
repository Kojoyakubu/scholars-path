// server/models/optionModel.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Question',
    index: true, // CRITICAL: Speeds up finding options for a question.
  },
  text: {
    type: String,
    required: [true, 'Option text cannot be empty.'],
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Option', optionSchema);