// server/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/subscriptionModel');

// --- Helper Functions ---

/**
 * Checks the subscription status for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>} - True if the user has an active subscription, false otherwise.
 */
const getSubscriptionStatus = async (userId) => {
  if (!userId) return false;
  const subscription = await Subscription.findOne({ user: userId });
  // A subscription is active if it exists, its status is 'active', and it has not expired.
  return !!(subscription && subscription.status === 'active' && subscription.expiresAt > new Date());
};

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param {object} user - The user object from the database.
 * @param {boolean} isSubscribed - The user's subscription status.
 * @returns {string} - The generated JWT.
 */
const generateToken = (user, isSubscribed) => {
  return jwt.sign({
    id: user._id,
    role: user.role,
    school: user.school, // Include school in the token for easier access in middleware
    isSubscribed,
  }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- Controller Functions ---

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, registerAsTeacher } = req.body;

  // Basic validation
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide full name, email, and password.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: registerAsTeacher ? 'teacher' : 'student',
    status: 'pending', // All new users require admin approval
  });

  if (user) {
    // On success, do not send back user data until they are approved.
    res.status(201).json({
      message: 'Registration successful! Your account is now pending admin approval.'
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data. Registration failed.');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password.');
  }

  // Check if the user's account has been approved by an admin
  if (user.status !== 'approved') {
    res.status(403); // Forbidden
    throw new Error(`Your account status is '${user.status}'. Admin approval is required to log in.`);
  }

  const isSubscribed = await getSubscriptionStatus(user._id);
  const token = generateToken(user, isSubscribed);

  res.json({
    _id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    school: user.school,
    isSubscribed,
    token,
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // The 'protect' middleware already fetches the user and attaches it to req.user.
  // This avoids an unnecessary database call.
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
      res.status(404);
      throw new Error('User not found.');
  }
  
  const isSubscribed = await getSubscriptionStatus(user._id);

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    school: user.school,
    isSubscribed,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};