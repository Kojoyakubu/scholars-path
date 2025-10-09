// server/models/quizModel.js
const mongoose = require('mongoose');
const Question = require('./questionModel'); // Required for cleanup
const QuizAttempt = require('./quizAttemptModel'); // Required for cleanup

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // ADDED: Removes whitespace
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Subject',
    index: true, // ADDED: Index for faster queries
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true, // ADDED: Index for faster queries
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true, // ADDED: Index for faster queries
  },
}, { timestamps: true });

// ADDED: Middleware to remove questions and attempts before deleting a quiz
quizSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Questions & Attempts being removed for quiz: ${this._id}`);
  await Question.deleteMany({ quiz: this._id });
  await QuizAttempt.deleteMany({ quiz: this._id });
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);