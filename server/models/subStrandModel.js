const mongoose = require('mongoose');

const subStrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    strand: { type: mongoose.Schema.Types.ObjectId, ref: 'Strand', required: true, index: true },
    description: { type: String },
    learningOutcomes: [{ type: String }],
    keyCompetencies: [{ type: String }],
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

subStrandSchema.index({ name: 1, strand: 1 }, { unique: true });

module.exports = mongoose.model('SubStrand', subStrandSchema);
