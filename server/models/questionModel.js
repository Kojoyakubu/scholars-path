const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    topicTags: [{ type: String }],
  },
  { timestamps: true }
);

// Virtual link to options
questionSchema.virtual('options', {
  ref: 'Option',
  localField: '_id',
  foreignField: 'question',
});

module.exports = mongoose.model('Question', questionSchema);
