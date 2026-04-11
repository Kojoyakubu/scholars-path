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
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'school_admin'],
      default: 'student',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'locked'],
      default: 'pending',
      index: true,
    },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    aiOnboarded: { type: Boolean, default: false },
    aiLastPromptUsed: { type: String },
    
    // Security enhancements
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLogin: Date,
    refreshToken: String,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,

    // Download payment exemption (managed by admin)
    downloadPaymentExempt: { type: Boolean, default: false },
    downloadPaymentExemptReason: { type: String, trim: true },
    downloadPaymentExemptUntil: { type: Date, default: null },
    downloadPaymentExemptSetBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    downloadPaymentExemptSetAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Account lockout constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Instance methods for account security
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + LOCK_TIME,
      status: 'locked'
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Virtual property to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
