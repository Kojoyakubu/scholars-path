// server/models/questionModel.js
const mongoose = require('mongoose');
const Option = require('./optionModel'); // Required for cleanup

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz',
    index: true, // ADDED: Index for faster queries
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
    enum: ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'],
    default: 'MCQ',
  },
}, { timestamps: true });

// ADDED: Middleware to remove options before deleting a question
questionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Options being removed for question: ${this._id}`);
  await Option.deleteMany({ question: this._id });
  next();
});

module.exports = mongoose.model('Question', questionSchema);