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
      name: user.fullName || user.name, // ✅ FIXED: handle both field names
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

  console.log('📥 Registration request:', { fullName, email, role }); // Debug log

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
  
  // ✅ FIXED: Save as fullName (matching the User model schema)
  const user = await User.create({
    fullName: fullName,  // Changed from 'name' to 'fullName'
    email,
    password: hashedPassword,
    role: role || 'student',
    school: school || null,
  });

  if (user) {
    console.log('✅ User created successfully:', user._id);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.fullName, // Return fullName as name for frontend compatibility
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        school: user.school,
        token: generateToken(user),
      },
    });
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
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName || user.name || '', // Support both field names
        fullName: user.fullName || user.name || '',
        email: user.email,
        role: user.role,
        school: user.school,
        token,
      },
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(
    users.map((user) => ({
      id: user._id,
      name: user.fullName || user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      createdAt: user.createdAt,
    }))
  );
});

// @desc    Get a specific user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json({
      id: user._id,
      name: user.fullName || user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update a user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Support both fullName and name fields
  if (req.body.fullName) {
    user.fullName = req.body.fullName;
  } else if (req.body.name) {
    user.fullName = req.body.name;
  }
  
  user.email = req.body.email || user.email;

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
      token: generateToken(updatedUser),
    },
  });
});

// @desc    Delete a user (Admin only)
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
  getUserProfile,
  updateUserProfile,
  deleteUser,
};