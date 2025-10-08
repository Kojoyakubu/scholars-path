const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  subStrand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubStrand',
  },
  fileName: {
    type: String,
    required: true,
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
  },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);