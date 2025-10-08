const User = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/subscriptionModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { fullName, email, password, registerAsTeacher } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName, email, password: hashedPassword,
      role: registerAsTeacher ? 'teacher' : 'student',
      status: 'pending',
    });
    if (user) {
      res.status(201).json({ message: 'Registration successful! Your account is now pending admin approval.' });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.status !== 'approved') {
      return res.status(401).json({ message: `Your account is ${user.status}. Admin approval required.` });
    }
    const subscription = await Subscription.findOne({ user: user._id });
    const isSubscribed = subscription && subscription.status === 'active' && subscription.expiresAt > new Date();
    res.json({
      _id: user.id, fullName: user.fullName, email: user.email,
      role: user.role, school: user.school, isSubscribed,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// --- CORRECTED FUNCTION ---
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id); // Get fresh user data

  if (user) {
    const subscription = await Subscription.findOne({ user: user._id });
    const isSubscribed = subscription && subscription.status === 'active' && subscription.expiresAt > new Date();
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
      isSubscribed, // Send the fresh subscription status
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};