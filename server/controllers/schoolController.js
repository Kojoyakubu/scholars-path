const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');

const getSchoolDashboard = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (req.user.role !== 'admin' && (!req.user.school || req.user.school.toString() !== schoolId)) {
      return res.status(403).json({ message: 'Not authorized to view this school dashboard.' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getSchoolDashboard };