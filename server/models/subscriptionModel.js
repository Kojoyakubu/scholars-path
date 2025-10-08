const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
  plan: {
    type: String, // e.g., 'teacher_monthly', 'school_yearly'
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive',
  },
  paystackReference: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);