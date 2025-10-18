// server/models/quizModel.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required.'],
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Subject',
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true,
  },
}, { 
  timestamps: true,
  // Enable virtuals for JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to populate questions associated with this quiz.
// This defines the relationship without storing an array of IDs here.
quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz'
});

// Middleware to remove child documents before deleting a quiz
quizSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing questions & attempts for quiz: ${this.title}`);
  // Using this._id is safe here. We can use Promise.all to run in parallel.
  await Promise.all([
    mongoose.model('Question').deleteMany({ quiz: this._id }),
    mongoose.model('QuizAttempt').deleteMany({ quiz: this._id })
  ]);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);