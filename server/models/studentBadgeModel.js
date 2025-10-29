const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
    dateAwarded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);
