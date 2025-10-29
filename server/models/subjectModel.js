const mongoose = require('mongoose');
const Strand = require('./strandModel');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

subjectSchema.index({ name: 1, class: 1 }, { unique: true });

subjectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await Strand.deleteMany({ subject: this._id });
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);
