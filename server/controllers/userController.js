const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // Frontend sends 'fullName', but your DB schema likely uses 'name'.
  // We'll use 'fullName' from the request body to create the user.
  const { fullName, email, password, role, school } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide full name, email, and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: fullName, // Save to the 'name' field in the database
    email,
    password: hashedPassword,
    role: role || 'student',
    school: school || null,
  });

  if (user) {
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        fullName: user.name, // ✅ Send back 'fullName'
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.name, // ✅ THE FIX: Changed 'name' to 'fullName'
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  // To be consistent, we can map the response
  const formattedUsers = users.map(user => ({
    id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
    createdAt: user.createdAt,
  }));
  res.json(formattedUsers);
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json({
        id: user._id,
        fullName: user.name,
        email: user.email,
        role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.fullName || user.name; // Expect fullName from frontend
    user.email = req.body.email || user.email;
    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
        message: 'Profile updated successfully',
        user: {
            id: updatedUser._id,
            fullName: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        },
    });
});


/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
});

// Remove getUserSummary as getUserProfile serves a similar, now corrected, purpose.
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};