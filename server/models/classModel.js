// server/models/classModel.js
const mongoose = require('mongoose');
const Subject = require('./subjectModel'); // Required for cascading delete

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required.'],
    trim: true,
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Level',
    index: true, // Keeps the fast lookup by level
  },
}, { timestamps: true });

// Compound Index: Enforces that the 'name' of a class is unique within the scope of its 'level'.
classSchema.index({ name: 1, level: 1 }, { unique: true });

// Middleware Hook: Before deleting a Class, remove all associated Subjects.
classSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing subjects for class: ${this.name}`);
  await Subject.deleteMany({ class: this._id });
  next();
});

module.exports = mongoose.model('Class', classSchema);