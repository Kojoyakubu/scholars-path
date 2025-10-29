const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address.'],
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'school_admin'],
      default: 'student',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
      index: true,
    },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    aiOnboarded: { type: Boolean, default: false },
    aiLastPromptUsed: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
