const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String },
    contactEmail: { type: String },
    description: { type: String },
    aiGeneratedAt: { type: Date },
    aiProvider: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
