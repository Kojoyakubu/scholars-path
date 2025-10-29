const mongoose = require('mongoose');

const learnerNoteSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    subStrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubStrand', required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearnerNote', learnerNoteSchema);
