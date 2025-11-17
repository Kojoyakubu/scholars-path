const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    explanation: { type: String }, // ✅ Explanation for the correct answer
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    topicTags: [{ type: String }],
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', index: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual link to options
questionSchema.virtual('options', {
  ref: 'Option',
  localField: '_id',
  foreignField: 'question',
});

// ✅ FIX: Check if model exists before creating to prevent OverwriteModelError
module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);