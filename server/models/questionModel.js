const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz',
  },
  section: {
    type: String,
    required: true,
    default: 'Section A',
  },
  text: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    // UPDATED LIST
    enum: ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'],
    default: 'MCQ',
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);