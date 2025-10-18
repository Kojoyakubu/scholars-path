// server/models/studentBadgeModel.js
const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true, // Index for quickly finding all badges for one student
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Badge',
    index: true, // Index for quickly finding all students with one badge
  },
}, { timestamps: true });

// Your original index was EXCELLENT. It ensures a student can only earn a specific badge once.
studentBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);