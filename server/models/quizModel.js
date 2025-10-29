const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz',
});

quizSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await Promise.all([
    mongoose.model('Question').deleteMany({ quiz: this._id }),
    mongoose.model('QuizAttempt').deleteMany({ quiz: this._id }),
  ]);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
