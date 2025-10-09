// server/models/levelModel.js
const mongoose = require('mongoose');
const Class = require('./classModel'); // Required for the cleanup hook

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // ADDED: Removes whitespace
  },
}, { timestamps: true });

// ADDED: Middleware hook to remove children classes before deleting a level
levelSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Classes being removed for level: ${this._id}`);
  await Class.deleteMany({ level: this._id });
  next();
});

module.exports = mongoose.model('Level', levelSchema);