const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, school } = req.body;
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
  const user = await User.create({ name: fullName, email, password: hashedPassword, role: role || 'student', school: school || null });
  if (user) {
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, fullName: user.name, email: user.email, role: user.role } });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, fullName: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  const formattedUsers = users.map(user => ({ id: user._id, fullName: user.name, email: user.email, role: user.role, school: user.school, createdAt: user.createdAt }));
  res.json(formattedUsers);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json({ id: user._id, fullName: user.name, email: user.email, role: user.role });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  user.name = req.body.fullName || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }
  const updatedUser = await user.save();
  res.json({ message: 'Profile updated successfully', user: { id: updatedUser._id, fullName: updatedUser.name, email: updatedUser.email, role: updatedUser.role } });
});

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