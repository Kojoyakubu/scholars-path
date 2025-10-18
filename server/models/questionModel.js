// server/models/questionModel.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz',
    index: true,
  },
  section: {
    type: String,
    required: true,
    default: 'Section A',
    trim: true,
  },
  text: {
    type: String,
    required: [true, 'Question text cannot be empty.'],
    trim: true,
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'],
    default: 'MCQ',
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to populate options associated with this question
questionSchema.virtual('options', {
  ref: 'Option',
  localField: '_id',
  foreignField: 'question'
});

// Middleware to remove options before deleting a question
questionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing options for question: ${this._id}`);
  await mongoose.model('Option').deleteMany({ question: this._id });
  next();
});

module.exports = mongoose.model('Question', questionSchema);