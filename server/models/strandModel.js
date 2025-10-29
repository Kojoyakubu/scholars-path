const mongoose = require('mongoose');
const SubStrand = require('./subStrandModel');

const strandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

strandSchema.index({ name: 1, subject: 1 }, { unique: true });

strandSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await SubStrand.deleteMany({ strand: this._id });
  next();
});

module.exports = mongoose.model('Strand', strandSchema);
