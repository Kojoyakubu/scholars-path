// server/models/lessonNoteModel.js
const mongoose = require('mongoose');

const lessonNoteSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true, // Index for faster queries by teacher
  },
  subStrand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubStrand',
    index: true, // Index for faster queries by sub-strand
  },
  content: { // The AI-generated markdown content is the single source of truth.
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true, // Index for faster queries by school
  },
}, { timestamps: true });

module.exports = mongoose.model('LessonNote', lessonNoteSchema);