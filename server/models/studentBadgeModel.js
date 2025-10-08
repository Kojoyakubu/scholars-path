const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Badge',
  },
}, { timestamps: true });

// Ensure a student can only earn a specific badge once
studentBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);