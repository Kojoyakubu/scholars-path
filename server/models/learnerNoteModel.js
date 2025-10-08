const mongoose = require('mongoose');

const learnerNoteSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // The teacher who generated it
  },
  subStrand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubStrand',
  },
  content: {
    type: String,
    required: true, // The AI-generated content for the student
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
}, { timestamps: true });

module.exports = mongoose.model('LearnerNote', learnerNoteSchema);