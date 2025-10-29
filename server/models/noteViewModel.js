const mongoose = require('mongoose');

const noteViewSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'LearnerNote', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    duration: { type: Number, default: 0 }, // seconds spent
    deviceType: { type: String, enum: ['Mobile', 'Desktop'], default: 'Mobile' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NoteView', noteViewSchema);
