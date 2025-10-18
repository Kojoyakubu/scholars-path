// server/models/quizAttemptModel.js
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz',
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative.'], // Added validation
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: [0, 'Total questions cannot be negative.'], // Added validation
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true,
  },
  answers: [
    {
      _id: false, // Don't create a separate _id for each answer subdocument
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedOptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);