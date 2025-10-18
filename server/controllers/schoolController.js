// server/controllers/schoolController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');
const mongoose = require('mongoose');

// @desc    Get dashboard analytics for a specific school
// @route   GET /api/school/dashboard/:schoolId
// @access  Private (Admin or School Admin of that school)
const getSchoolDashboard = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;

  // Validate that schoolId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    res.status(400);
    throw new Error('Invalid School ID format.');
  }

  // Authorization Check:
  // Allow if the user is a super 'admin'.
  // OR if the user is a 'school_admin' AND their school ID matches the requested schoolId.
  const isSuperAdmin = req.user.role === 'admin';
  const isAuthorizedSchoolAdmin = 
    req.user.role === 'school_admin' && 
    req.user.school && 
    req.user.school.toString() === schoolId;

  if (!isSuperAdmin && !isAuthorizedSchoolAdmin) {
    res.status(403); // Forbidden
    throw new Error('Not authorized to view this school dashboard.');
  }

  // Use Promise.all to run database queries in parallel for better performance.
  // Use countDocuments when you only need the count, it's much faster than fetching all documents.
  const [teacherCount, studentCount, quizAttemptCount] = await Promise.all([
      User.countDocuments({ school: schoolId, role: 'teacher' }),
      User.countDocuments({ school: schoolId, role: 'student' }),
      QuizAttempt.countDocuments({ school: schoolId }),
  ]);

  // If you also need the lists of users, you could add them to the Promise.all
  // For now, the dashboard only needs counts.
  // const teachers = await User.find({ school: schoolId, role: 'teacher' }).select('fullName email');
  // const students = await User.find({ school: schoolId, role: 'student' }).select('fullName email');

  res.json({
    totalTeachers: teacherCount,
    totalStudents: studentCount,
    totalQuizAttempts: quizAttemptCount,
  });
});

module.exports = { getSchoolDashboard };