const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');

const getSchoolDashboard = async (req, res) => {
  try {
    const { schoolId } = req.params; // Get ID from the URL

    // SECURITY CHECK:
    // Allow if the user is a top-level admin, OR
    // if the user is a school_admin for THIS specific school.
    if (req.user.role !== 'admin' && req.user.school.toString() !== schoolId) {
      return res.status(403).json({ message: 'Not authorized to view this school dashboard.' });
    }

    const teachers = await User.find({ school: schoolId, role: 'teacher' });
    const students = await User.find({ school: schoolId, role: 'student' });
    const quizAttempts = await QuizAttempt.find({ school: schoolId });

    res.json({
      teachers,
      students,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      totalQuizAttempts: quizAttempts.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getSchoolDashboard };