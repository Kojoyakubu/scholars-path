const mongoose = require('mongoose');

const lessonNoteSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  subStrand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubStrand',
  },
  content: {
    type: String,
    required: true,
  },
  learningObjectives: {
    type: String,
  },
  teachingAids: {
    type: String,
  },
  duration: {
    type: String,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
}, { timestamps: true });

module.exports = mongoose.model('LessonNote', lessonNoteSchema);