// server/models/noteViewModel.js
const mongoose = require('mongoose');

const noteViewSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'LearnerNote',
    index: true, // ADDED: Index
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true, // ADDED: Index
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // The author of the note
  },
  // ADDED: The school field for efficient analytics
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('NoteView', noteViewSchema);