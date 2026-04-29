const mongoose = require('mongoose');

const termWeekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true, min: 1, max: 20 },
    weekEnding: { type: Date, required: true },
  },
  { _id: false }
);

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String },
    contactEmail: { type: String },
    description: { type: String },
    termCalendar: {
      one: { type: [termWeekSchema], default: [] },
      two: { type: [termWeekSchema], default: [] },
      three: { type: [termWeekSchema], default: [] },
    },
    aiGeneratedAt: { type: Date },
    aiProvider: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
