// server/models/strandModel.js
const mongoose = require('mongoose');
const SubStrand = require('./subStrandModel'); // Required for cascading delete

const strandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Strand name is required.'],
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Subject',
    index: true,
  },
}, { timestamps: true });

// Compound Index: Ensures strand name is unique per subject.
strandSchema.index({ name: 1, subject: 1 }, { unique: true });

// Middleware Hook: Before deleting a Strand, remove all associated SubStrands.
strandSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing sub-strands for strand: ${this.name}`);
  await SubStrand.deleteMany({ strand: this._id });
  next();
});

module.exports = mongoose.model('Strand', strandSchema);