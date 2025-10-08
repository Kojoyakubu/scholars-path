const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'admin', 'school_admin'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null // Null for individual learners/main admins
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);