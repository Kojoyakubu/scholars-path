// server/models/levelModel.js
const mongoose = require('mongoose');
const Class = require('./classModel');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Level name is required.'], // Added custom error message
    unique: true,
    trim: true, // Removes leading/trailing whitespace
  },
}, { timestamps: true });

// Middleware Hook: Before a Level document is deleted, this hook will
// find and delete all Class documents that reference this level.
// This prevents orphaned Class documents in the database.
levelSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascading delete: Removing classes for level: ${this.name}`);
  await Class.deleteMany({ level: this._id });
  next();
});

module.exports = mongoose.model('Level', levelSchema);