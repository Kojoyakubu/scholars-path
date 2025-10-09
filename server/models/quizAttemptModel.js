// server/models/quizAttemptModel.js
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz',
    index: true, // ADDED: Index
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true, // ADDED: Index
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true, // ADDED: Index
  },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedOptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);