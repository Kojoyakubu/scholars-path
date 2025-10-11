// models/userModel.js (Revised)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true, // Ensures email is stored in lowercase
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    index: true, // Add index for faster queries
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'admin', 'school_admin'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended'],
    default: 'pending',
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);