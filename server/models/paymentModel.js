const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      default: 'GHS', // 🇬🇭 Default to Ghanaian cedis
    },
    method: {
      type: String,
      trim: true,
      default: 'mobile_money',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    purpose: {
      type: String,
      enum: ['subscription', 'quiz', 'resource', 'download', 'other'],
      default: 'subscription',
    },
    itemType: {
      type: String,
      enum: ['lesson_note', 'learner_note', 'quiz'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    downloadFormat: {
      type: String,
      enum: ['pdf', 'html', 'doc', 'txt'],
    },
    description: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
