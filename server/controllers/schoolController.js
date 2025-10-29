// /server/controllers/schoolController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const School = require('../models/schoolModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const aiService = require('../services/aiService');

/**
 * @desc   Register a new school
 * @route  POST /api/schools
 * @access Private (Admin/System)
 */
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

  const school = await School.create({
    name,
    location,
    contactEmail,
  });

  let aiDescription = '';
  if (aiDescribe) {
    try {
      const prompt = `
You are a Ghanaian education consultant.
Write a concise school profile for the following school:

Name: ${name}
Location: ${location}
Purpose: A modern educational institution on the Scholars Path platform.

Guidelines:
- Write in a warm, professional tone (2–4 sentences).
- Mention the school's focus, values, and possible community or digital presence.
- Avoid generic words like "good" or "great".
- Make it unique and realistic.
`;

      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'schoolProfile',
        temperature: 0.55,
        preferredProvider: 'gemini',
      });

      aiDescription = text.trim();
      school.description = aiDescription;
      await school.save();
    } catch (err) {
      console.error('AI school description failed:', err.message);
    }
  }

  res.status(201).json({
    message: 'School created successfully.',
    school,
    aiGeneratedDescription: aiDescription,
  });
});

/**
 * @desc   Get all schools (admin)
 * @route  GET /api/schools
 * @access Private (Admin)
 */
const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find().sort({ createdAt: -1 });
  res.json(schools);
});

/**
 * @desc   Get school details including teacher and student count
 * @route  GET /api/schools/:id
 * @access Private (Admin/Teacher)
 */
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
    Teacher.countDocuments({ school: id }),
    Student.countDocuments({ school: id }),
  ]);

  res.json({
    school,
    teacherCount,
    studentCount,
  });
});

/**
 * @desc   Update school info and optionally regenerate AI description
 * @route  PUT /api/schools/:id
 * @access Private (Admin)
 */
const updateSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, contactEmail, regenerateDescription } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid school ID.');
  }

  const school = await School.findById(id);
  if (!school) {
    res.status(404);
    throw new Error('School not found.');
  }

  school.name = name || school.name;
  school.location = location || school.location;
  school.contactEmail = contactEmail || school.contactEmail;

  // 🧠 Regenerate school profile with AI if requested
  if (regenerateDescription) {
    try {
      const prompt = `
Generate a polished, professional school profile for:

Name: ${school.name}
Location: ${school.location}
Existing Description: ${school.description || 'N/A'}

Guidelines:
- Make it inspiring and Ghanaian-context appropriate.
- Limit to 4 sentences.
`;

      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'schoolProfileUpdate',
        temperature: 0.5,
      });

      school.description = text.trim();
    } catch (err) {
      console.error('AI school re-description failed:', err.message);
    }
  }

  await school.save();
  res.json({ message: 'School updated successfully.', school });
});

/**
 * @desc   Delete a school
 * @route  DELETE /api/schools/:id
 * @access Private (Admin)
 */
const deleteSchool = asyncHandler(async (req, res) => {
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

  await school.deleteOne();
  res.json({ message: 'School deleted successfully.' });
});

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolDetails,
  updateSchool,
  deleteSchool,
};
