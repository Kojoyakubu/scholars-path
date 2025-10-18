// server/models/resourceModel.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  subStrand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubStrand',
    index: true,
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);