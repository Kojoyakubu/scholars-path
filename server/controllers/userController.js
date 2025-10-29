// /server/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const School = require('../models/schoolModel');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');

/**
 * @desc    Register a new user (teacher, student, or admin)
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, schoolId, aiWelcome } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    school: schoolId || null,
  });

  // 🧠 Generate a custom AI onboarding message if requested
  let aiWelcomeMessage = '';
  if (aiWelcome) {
    try {
      const prompt = `
You are a friendly Ghanaian school assistant.
Write a short welcome message (2–4 sentences) for a new user on the Scholars Path platform.

User Info:
- Name: ${name}
- Role: ${role}
- School: ${(await School.findById(schoolId))?.name || 'Independent User'}

Tone:
- Friendly, warm, and motivational.
- Encourage engagement with the learning tools available.
`;

      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'userOnboarding',
        temperature: 0.65,
        preferredProvider: 'chatgpt',
      });

      aiWelcomeMessage = text.trim();
    } catch (err) {
      console.error('AI onboarding failed:', err.message);
    }
  }

  res.status(201).json({
    message: 'User registered successfully.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    aiWelcomeMessage,
  });
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate('school', 'name')
    .select('-password')
    .sort({ createdAt: -1 });
  res.json(users);
});

/**
 * @desc    Get a single user profile
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid user ID.');
  }

  const user = await User.findById(id).populate('school', 'name location');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
  });
});

/**
 * @desc    Generate AI user summary (for admin insights)
 * @route   GET /api/users/:id/summary
 * @access  Private (Admin)
 */
const getUserSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid user ID.');
  }

  const user = await User.findById(id).populate('school', 'name location');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const prompt = `
You are an AI assistant for Scholars Path.
Generate a short summary (3–5 sentences) about this user's profile.

User Information:
- Name: ${user.name}
- Role: ${user.role}
- Email: ${user.email}
- School: ${user.school?.name || 'Independent User'}
- Location: ${user.school?.location || 'Not specified'}

Guidelines:
- Keep tone respectful and professional.
- Highlight what this role means within the platform (e.g., teacher uploads notes, student takes quizzes, admin manages users).
- Mention one area of engagement or improvement based on the role type.
`;

  try {
    const { text, provider, model } = await aiService.generateTextCore({
      prompt,
      task: 'userSummary',
      temperature: 0.55,
      preferredProvider: 'gemini',
    });

    res.json({
      user,
      aiSummary: text.trim(),
      provider,
      model,
    });
  } catch (err) {
    console.error('AI user summary failed:', err.message);
    res.json({
      user,
      aiSummary: `User ${user.name} is a valued ${user.role} on Scholars Path, contributing actively to the school learning ecosystem.`,
      provider: 'fallback',
    });
  }
});

/**
 * @desc    Update user profile (Admin or self)
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, schoolId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid user ID.');
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.school = schoolId || user.school;

  await user.save();
  res.json({ message: 'User updated successfully.', user });
});

/**
 * @desc    Delete a user (admin)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid user ID.');
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully.' });
});

module.exports = {
  registerUser,
  getAllUsers,
  getUserProfile,
  getUserSummary,
  updateUserProfile,
  deleteUser,
};
