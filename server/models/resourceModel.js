const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subStrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubStrand', required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    aiDescription: { type: String }, // Auto-summary
    aiProvider: { type: String },
    aiModel: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
