// server/models/subjectModel.js
const mongoose = require('mongoose');
const Strand = require('./strandModel'); // Required for cascading delete

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required.'],
    trim: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Class',
    index: true,
  },
}, { timestamps: true });

// Compound Index: Ensures subject name is unique per class.
subjectSchema.index({ name: 1, class: 1 }, { unique: true });

// Middleware Hook: Before deleting a Subject, remove all associated Strands.
subjectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing strands for subject: ${this.name}`);
  await Strand.deleteMany({ subject: this._id });
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);