// server/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide a full name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address.'
    ],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [6, 'Password must be at least 6 characters long.'], // Added custom error message
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
    index: true, // Index for quickly filtering users by status (e.g., finding all 'pending' users)
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null,
    index: true, // Index for finding all users in a school
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);