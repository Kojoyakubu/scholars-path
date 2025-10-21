// server/models/learnerNoteModel.js
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
    index: true, // Index for faster queries
  },
  content: {
    type: String,
    required: [true, 'Note content is required.'],
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true, // Index for faster queries
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft', // New notes will be drafts by default
  },
}, { timestamps: true });

module.exports = mongoose.model('LearnerNote', learnerNoteSchema);