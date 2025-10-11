const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');

// @desc    Get dashboard analytics for a school
// @route   GET /api/school/dashboard/:schoolId
// @access  Private (Admin or School Admin)
const getSchoolDashboard = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;

  // Authorization check
  if (req.user.role !== 'admin' && (!req.user.school || req.user.school.toString() !== schoolId)) {
    res.status(403);
    throw new Error('Not authorized to view this school dashboard.');
  }

  const [teachers, students, quizAttempts] = await Promise.all([
      User.find({ school: schoolId, role: 'teacher' }).select('-password'),
      User.find({ school: schoolId, role: 'student' }).select('-password'),
      QuizAttempt.find({ school: schoolId }),
  ]);

  res.json({
    teachers,
    students,
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalQuizAttempts: quizAttempts.length,
  });
});

module.exports = { getSchoolDashboard };