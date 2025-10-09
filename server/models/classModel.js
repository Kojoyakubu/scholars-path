// server/models/classModel.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // ADDED: Removes whitespace
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Level', 
    index: true, // ADDED: Index for faster queries by level
  },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);