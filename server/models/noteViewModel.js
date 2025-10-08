const mongoose = require('mongoose');

const noteViewSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'LearnerNote',
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // The author of the note
  }
}, { timestamps: true });

module.exports = mongoose.model('NoteView', noteViewSchema);