const mongoose = require('mongoose');

const lessonNoteSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    subStrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubStrand', required: true },
    content: { type: String, required: true },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LessonNote', lessonNoteSchema);
