// server/models/subscriptionModel.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true, // A user can only have one subscription document
    sparse: true, // Allows multiple null values, so school-based subs without a user are fine
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    // Consider adding unique: true if a school can only have one subscription
  },
  plan: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive',
    index: true, // For quick lookups by status
  },
  paystackReference: {
    type: String,
    trim: true,
  },
  expiresAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);