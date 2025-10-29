const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    plan: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive',
      index: true,
    },
    paystackReference: { type: String, trim: true },
    expiresAt: { type: Date },
    aiInsights: { type: String },
    aiProvider: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
