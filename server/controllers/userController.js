const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Utility: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      school: user.school,
      name: user.fullName,
      status: user.status, // ✅ Include status in token
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, school } = req.body;

  console.log('📥 Registration request:', { fullName, email, role });

  if (!fullName || !email || !password) {
    res.status(400).json({ message: 'Please provide full name, email, and password' });
    return;
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // ✅ Determine status based on role
  const userRole = role || 'student';
  const userStatus = userRole === 'student' ? 'approved' : 'pending';
  
  const user = await User.create({
    fullName: fullName,
    email,
    password: hashedPassword,
    role: userRole,
    school: school || null,
    status: userStatus, // ✅ Students 'approved', others 'pending'
  });

  if (user) {
    console.log('✅ User created:', user._id, 'Status:', user.status);
    
    // ✅ Different responses based on status
    if (user.status === 'pending') {
      // User needs approval - don't send token
      res.status(201).json({
        message: 'Registration successful. Your account is pending admin approval. You will receive a notification once approved.',
        needsApproval: true,
        user: {
          id: user._id,
          name: user.fullName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      // Student - auto-approved, send token
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.fullName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          school: user.school,
          status: user.status,
          token: generateToken(user),
        },
      });
    }
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    
    // ✅ CHECK STATUS BEFORE ALLOWING LOGIN
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

    // Only 'approved' users can login
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        school: user.school,
        status: user.status,
        token,
      },
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
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
    res.json({
      id: user._id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
      status: user.status,
      aiOnboarded: user.aiOnboarded,
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
    user.password = await bcrypt.hash(req.body.password, 10);
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
      token: generateToken(updatedUser),
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
  loginUser,
  getAllUsers,
  getPendingUsers,
  approveUser,
  suspendUser,
  rejectUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};