// controllers/userController.js (Revised)

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/subscriptionModel');

// --- Helper Functions ---
const getSubscriptionStatus = async (userId) => {
  const subscription = await Subscription.findOne({ user: userId });
  return !!(subscription && subscription.status === 'active' && subscription.expiresAt > new Date());
};

const generateToken = (user, isSubscribed) => {
  return jwt.sign({
    id: user._id,
    role: user.role,
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

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: registerAsTeacher ? 'teacher' : 'student',
    status: 'pending',
  });

  if (user) {
    res.status(201).json({
      message: 'Registration successful! Your account is now pending admin approval.'
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'approved') {
    res.status(403); // Use 403 Forbidden
    throw new Error(`Your account status is '${user.status}'. Admin approval is required.`);
  }

  const isSubscribed = await getSubscriptionStatus(user._id);

  res.json({
    _id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    school: user.school,
    isSubscribed,
    token: generateToken(user, isSubscribed),
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware, no need to query DB again
  const user = req.user;
  
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