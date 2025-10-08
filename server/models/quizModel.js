const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: { // CHANGED from subStrand
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Subject', // CHANGED ref to 'Subject'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);