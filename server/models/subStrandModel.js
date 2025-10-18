// server/models/subStrandModel.js
const mongoose = require('mongoose');

const subStrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sub-strand name is required.'],
    trim: true,
  },
  strand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Strand',
    index: true,
  },
}, { timestamps: true });

// Compound Index: Ensures sub-strand name is unique per strand.
subStrandSchema.index({ name: 1, strand: 1 }, { unique: true });

module.exports = mongoose.model('SubStrand', subStrandSchema);