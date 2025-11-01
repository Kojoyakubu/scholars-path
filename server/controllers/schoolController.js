// /server/controllers/schoolController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const School = require('../models/schoolModel');
const User = require('../models/userModel');
const aiService = require('../services/aiService');

// -----------------------------------------------------------------------------
// 🏫 CRUD CONTROLLERS
// -----------------------------------------------------------------------------

// Create School
const createSchool = asyncHandler(async (req, res) => {
  const { name, location, contactEmail, aiDescribe } = req.body;
  if (!name || !location) {
    res.status(400);
    throw new Error('School name and location are required.');
  }

  const existing = await School.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error('A school with this name already exists.');
  }

  const school = await School.create({ name, location, contactEmail });

  // Optionally generate AI description
  if (aiDescribe) {
    try {
      const prompt = `
You are a Ghanaian education consultant.
Write a concise school profile for the following school:

Name: ${name}
Location: ${location}
Purpose: A modern educational institution on the Scholars Path platform.

Guidelines:
- 2–4 sentences.
- Warm, realistic tone.
`;
      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'schoolProfile',
        temperature: 0.55,
      });
      school.description = text.trim();
      await school.save();
    } catch (err) {
      console.error('AI school description failed:', err.message);
    }
  }

  res.status(201).json({ message: 'School created successfully.', school });
});

// Get all schools
const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find().sort({ createdAt: -1 });
  res.json(schools);
});

// Get school details + teacher/student count
const getSchoolDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid school ID.');
  }

  const school = await School.findById(id);
  if (!school) {
    res.status(404);
    throw new Error('School not found.');
  }

  const [teacherCount, studentCount] = await Promise.all([
    User.countDocuments({ school: id, role: 'teacher' }),
    User.countDocuments({ school: id, role: 'student' }),
  ]);

  res.json({ school, teacherCount, studentCount });
});

// Update school
const updateSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, contactEmail, regenerateDescription } = req.body;

  const school = await School.findById(id);
  if (!school) {
    res.status(404);
    throw new Error('School not found.');
  }

  school.name = name || school.name;
  school.location = location || school.location;
  school.contactEmail = contactEmail || school.contactEmail;

  if (regenerateDescription) {
    try {
      const prompt = `
Generate a refined school profile for:

Name: ${school.name}
Location: ${school.location}
Old Description: ${school.description || 'N/A'}
`;
      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'schoolProfileUpdate',
        temperature: 0.5,
      });
      school.description = text.trim();
    } catch (err) {
      console.error('AI re-description failed:', err.message);
    }
  }

  await school.save();
  res.json({ message: 'School updated successfully.', school });
});

// Delete school
const deleteSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const school = await School.findById(id);
  if (!school) {
    res.status(404);
    throw new Error('School not found.');
  }
  await school.deleteOne();
  res.json({ message: 'School deleted successfully.' });
});

// -----------------------------------------------------------------------------
// 🧠 NEW — DASHBOARD + INSIGHTS ROUTES
// -----------------------------------------------------------------------------

// @desc Summary counts for school dashboard
const getSchoolSummary = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  const [teacherCount, studentCount] = await Promise.all([
    User.countDocuments({ school: schoolId, role: 'teacher' }),
    User.countDocuments({ school: schoolId, role: 'student' }),
  ]);
  res.json({
    message: 'School summary fetched successfully.',
    teacherCount,
    studentCount,
  });
});

// @desc Generate AI insights for the school admin
const getSchoolInsights = asyncHandler(async (req, res) => {
  try {
    const prompt = `
You are an educational data analyst for a Ghanaian digital school.
Generate a short paragraph (3–4 sentences) offering insights and advice
for a school administrator reviewing their digital platform statistics.
Mention teacher and student participation in general terms.`;

    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'schoolInsights',
      temperature: 0.7,
      preferredProvider: 'claude',
    });

    res.json({ insight: text });
  } catch (err) {
    console.error('AI school insights failed:', err.message);
    res.json({ insight: 'Keep supporting your teachers and students toward better engagement!' });
  }
});

// @desc Combined dashboard data
const getSchoolDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  const [teacherCount, studentCount] = await Promise.all([
    User.countDocuments({ school: schoolId, role: 'teacher' }),
    User.countDocuments({ school: schoolId, role: 'student' }),
  ]);

  res.json({
    message: 'Dashboard data retrieved successfully.',
    teacherCount,
    studentCount,
  });
});

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------
module.exports = {
  createSchool,
  getAllSchools,
  getSchoolDetails,
  updateSchool,
  deleteSchool,
  getSchoolSummary,
  getSchoolInsights,
  getSchoolDashboard,
};
