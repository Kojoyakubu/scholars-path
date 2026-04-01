const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');
const {
  sendEmailVerification,
  sendPasswordReset,
  sendAccountLocked,
  generateSecureToken
} = require('../services/emailService');

// Utility: Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      school: user.school,
      name: user.fullName,
      status: user.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
};

// Utility: Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, school } = req.body;

  console.log('📥 Registration request:', { fullName, email, role });

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Hash password with higher salt rounds
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailVerificationToken = generateSecureToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Determine status based on role
  const userRole = role || 'student';
  const userStatus = userRole === 'student' ? 'approved' : 'pending';

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: userRole,
    school: school || null,
    status: userStatus,
    emailVerificationToken,
    emailVerificationExpires,
  });

  if (user) {
    console.log('✅ User created:', user._id, 'Status:', user.status);

    // Send email verification
    try {
      await sendEmailVerification(email, emailVerificationToken);
      console.log('📧 Verification email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Different responses based on status
    if (user.status === 'pending') {
      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account. Your account is also pending admin approval.',
        needsApproval: true,
        needsVerification: true,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: false,
        },
      });
    } else {
      // Student - auto-approved
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        needsVerification: true,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: false,
        },
        accessToken,
        refreshToken,
      });
    }
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Verify email
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Verification token is required' });
    return;
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400).json({ message: 'Invalid or expired verification token' });
    return;
  }

  // Update user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {

    // Check if account is locked
    if (user.isLocked) {
      res.status(423).json({
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
        locked: true,
        lockUntil: user.lockUntil
      });
      return;
    }

    // Check status
    if (user.status === 'pending') {
      res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for approval before logging in.',
        status: 'pending',
        needsApproval: true,
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        message: 'Your account has been suspended. Please contact an administrator.',
        status: 'suspended',
      });
      return;
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { id: user._id, type: '2fa_temp' },
        process.env.JWT_2FA_SECRET || process.env.JWT_SECRET,
        { expiresIn: '5m' } // 5 minutes to complete 2FA
      );

      res.json({
        message: 'Password verified. Please provide 2FA code.',
        requires2FA: true,
        tempToken,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const subscription = await Subscription.findOne({ user: user._id, status: 'active' });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        school: user.school,
        status: user.status,
        emailVerified: user.emailVerified,
        isSubscribed: !!subscription,
      },
      accessToken,
      refreshToken,
    });
  } else {
    // Handle failed login attempt
    if (user) {
      await user.incLoginAttempts();

      // Check if account just got locked
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked) {
        try {
          await sendAccountLocked(email);
        } catch (emailError) {
          console.error('Failed to send lockout email:', emailError);
        }
        res.status(423).json({
          message: 'Account locked due to multiple failed login attempts. Please try again in 2 hours.',
          locked: true
        });
        return;
      }
    }

    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(401).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists or not for security
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    return;
  }

  // Generate reset token
  const resetToken = generateSecureToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  try {
    await sendPasswordReset(email, resetToken);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
    return;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update user
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.resetLoginAttempts(); // Reset any failed attempts
  await user.save();

  res.json({ message: 'Password reset successfully' });
});

// @desc    Logout user (invalidate refresh token)
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.json({ message: 'Logged out successfully' });
});

// @desc    Enable 2FA for user
// @route   POST /api/users/enable-2fa
// @access  Private
const enable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.twoFactorEnabled) {
    res.status(400).json({ message: '2FA is already enabled' });
    return;
  }

  const secret = speakeasy.generateSecret({
    name: `Scholars Path (${user.email})`,
    issuer: 'Scholars Path'
  });

  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    message: '2FA setup initiated',
    secret: secret.base32,
    qrCode: qrCodeUrl,
    otpauth_url: secret.otpauth_url
  });
});

// @desc    Verify and enable 2FA
// @route   POST /api/users/verify-2fa
// @access  Private
const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);

  if (!user || !user.twoFactorSecret) {
    res.status(400).json({ message: '2FA setup not initiated' });
    return;
  }

  if (user.twoFactorEnabled) {
    res.status(400).json({ message: '2FA is already enabled' });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400).json({ message: 'Invalid 2FA token' });
    return;
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ message: '2FA enabled successfully' });
});

// @desc    Disable 2FA
// @route   POST /api/users/disable-2fa
// @access  Private
const disable2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);

  if (!user || !user.twoFactorEnabled) {
    res.status(400).json({ message: '2FA is not enabled' });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400).json({ message: 'Invalid 2FA token' });
    return;
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  res.json({ message: '2FA disabled successfully' });
});

// @desc    Verify 2FA token during login
// @route   POST /api/users/verify-2fa-login
// @access  Public (requires tempToken from login)
const verify2FALogin = asyncHandler(async (req, res) => {
  const { token, tempToken } = req.body;

  if (!token || !tempToken) {
    res.status(400).json({ message: '2FA token and temporary token are required' });
    return;
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_2FA_SECRET || process.env.JWT_SECRET);

    if (decoded.type !== '2fa_temp') {
      res.status(401).json({ message: 'Invalid temporary token' });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      res.status(400).json({ message: '2FA is not enabled for this account' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      res.status(400).json({ message: 'Invalid 2FA token' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const subscription = await Subscription.findOne({ user: user._id, status: 'active' });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        school: user.school,
        status: user.status,
        emailVerified: user.emailVerified,
        isSubscribed: !!subscription,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired temporary token' });
  }
});

// @desc    Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(
    users.map((user) => ({
      id: user._id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
      status: user.status,
      createdAt: user.createdAt,
    }))
  );
});

// @desc    Get pending users (need approval) - Admin only
// @route   GET /api/users/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ 
    status: 'pending',
  }).select('-password').sort({ createdAt: -1 });

  res.json({
    count: pendingUsers.length,
    users: pendingUsers.map(user => ({
      id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
      status: user.status,
      createdAt: user.createdAt,
    })),
  });
});

// @desc    Approve a user - Admin only
// @route   PATCH /api/users/approve/:id
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.status === 'approved') {
    res.status(400).json({ message: 'User is already approved' });
    return;
  }

  user.status = 'approved';
  await user.save();

  console.log('✅ User approved:', user._id, 'by admin:', req.user.id);

  // TODO: Send email notification to user

  res.json({
    message: `User ${user.fullName} approved successfully`,
    user: {
      id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

// @desc    Suspend a user - Admin only
// @route   PATCH /api/users/suspend/:id
// @access  Private/Admin
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  user.status = 'suspended';
  await user.save();

  console.log('⚠️ User suspended:', user._id, 'by admin:', req.user.id);

  res.json({
    message: `User ${user.fullName} suspended successfully`,
    user: {
      id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

// @desc    Reject a user (delete) - Admin only
// @route   DELETE /api/users/reject/:id
// @access  Private/Admin
const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.status === 'approved') {
    res.status(400).json({ message: 'Cannot reject an approved user. Suspend them instead.' });
    return;
  }

  const userName = user.fullName;
  await user.deleteOne();

  console.log('❌ User rejected and deleted:', req.params.id);

  // TODO: Send email notification to user

  res.json({ message: `User ${userName} rejected and removed` });
});

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (user) {
    const subscription = await Subscription.findOne({ user: user._id, status: 'active' });
    res.json({
      id: user._id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
      status: user.status,
      aiOnboarded: user.aiOnboarded,
      isSubscribed: !!subscription,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update logged-in user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Update allowed fields
  if (req.body.fullName) user.fullName = req.body.fullName;
  if (req.body.email) user.email = req.body.email;
  if (req.body.aiOnboarded !== undefined) user.aiOnboarded = req.body.aiOnboarded;
  if (req.body.aiLastPromptUsed) user.aiLastPromptUsed = req.body.aiLastPromptUsed;
  
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 12);
  }

  const updatedUser = await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      name: updatedUser.fullName,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      school: updatedUser.school,
      status: updatedUser.status,
      aiOnboarded: updatedUser.aiOnboarded,
      accessToken: generateAccessToken(updatedUser),
    },
  });
});

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
});

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  logoutUser,
  enable2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  getAllUsers,
  getPendingUsers,
  approveUser,
  suspendUser,
  rejectUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};