// /server/controllers/adminController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const User = require('../models/userModel');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const QuizAttempt = require('../models/quizAttemptModel');
const School = require('../models/schoolModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const aiService = require('../services/aiService');

// ============================================================================
// 👩‍🏫 TEACHER & STUDENT MANAGEMENT
// ============================================================================

/**
 * @desc   Get all teachers
 * @route  GET /api/admin/teachers
 * @access Private (Admin)
 */
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 });
  res.json(teachers);
});

/**
 * @desc   Get all students
 * @route  GET /api/admin/students
 * @access Private (Admin)
 */
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

/**
 * @desc   Delete a teacher with cascade and AI audit
 * @route  DELETE /api/admin/teachers/:id
 * @access Private (Admin)
 */
const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid teacher ID.');
  }

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found.');
  }

  // Cascade delete related data
  const [lessonNotes, quizzes] = await Promise.all([
    LessonNote.deleteMany({ teacher: id }),
    Quiz.deleteMany({ teacher: id }),
  ]);

  await teacher.deleteOne();

  // AI-generated audit summary
  let aiAudit = '';
  try {
    const prompt = `
You are a digital education auditor.
Generate a one-line summary describing the deletion of a teacher account.

Details:
- Teacher Name: ${teacher.name || 'N/A'}
- Total Lesson Notes Deleted: ${lessonNotes.deletedCount}
- Total Quizzes Deleted: ${quizzes.deletedCount}

Keep it concise and formal.
`;
    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'deleteTeacherAudit',
      temperature: 0.4,
    });
    aiAudit = text.trim();
  } catch (err) {
    aiAudit = 'Teacher deleted successfully with associated records removed.';
  }

  res.json({
    message: 'Teacher deleted successfully.',
    audit: aiAudit,
  });
});

/**
 * @desc   Delete a student with cascade and AI audit
 * @route  DELETE /api/admin/students/:id
 * @access Private (Admin)
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid student ID.');
  }

  const student = await Student.findById(id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found.');
  }

  const [attempts, badges, views] = await Promise.all([
    QuizAttempt.deleteMany({ student: id }),
    StudentBadge.deleteMany({ student: id }),
    NoteView.deleteMany({ student: id }),
  ]);

  await student.deleteOne();

  // AI-generated audit summary
  let aiAudit = '';
  try {
    const prompt = `
You are a system audit assistant.
Write a one-line report about a student account removal.

Data:
- Student Name: ${student.name || 'N/A'}
- Quiz Attempts Deleted: ${attempts.deletedCount}
- Badges Removed: ${badges.deletedCount}
- Note Views Removed: ${views.deletedCount}

Use a neutral professional tone.
`;
    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'deleteStudentAudit',
      temperature: 0.4,
    });
    aiAudit = text.trim();
  } catch (err) {
    aiAudit = 'Student deleted successfully with related data removed.';
  }

  res.json({
    message: 'Student deleted successfully.',
    audit: aiAudit,
  });
});

// ============================================================================
// 📊 ANALYTICS & INSIGHTS
// ============================================================================

/**
 * @desc   Platform overview stats
 * @route  GET /api/admin/analytics/overview
 * @access Private (Admin)
 */
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const [totalUsers, totalTeachers, totalStudents, totalSchools, totalNotes, totalQuizzes, totalAttempts] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      School.countDocuments(),
      LessonNote.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
    ]);

  res.json({
    totalUsers,
    totalTeachers,
    totalStudents,
    totalSchools,
    totalNotes,
    totalQuizzes,
    totalAttempts,
  });
});

/**
 * @desc   Top active teachers
 * @route  GET /api/admin/analytics/top-teachers
 * @access Private (Admin)
 */
const getTopTeachers = asyncHandler(async (req, res) => {
  const teachers = await LessonNote.aggregate([
    { $group: { _id: '$teacher', totalNotes: { $sum: 1 } } },
    { $sort: { totalNotes: -1 } },
    { $limit: 5 },
  ]);

  const populated = await User.populate(teachers, { path: '_id', select: 'fullName email role school' });
  res.json(populated);
});

/**
 * @desc   Top performing students
 * @route  GET /api/admin/analytics/top-students
 * @access Private (Admin)
 */
const getTopStudents = asyncHandler(async (req, res) => {
  const students = await QuizAttempt.aggregate([
    {
      $group: {
        _id: '$student',
        avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: 5 },
  ]);

  const populated = await User.populate(students, { path: '_id', select: 'fullName email role school' });
  res.json(populated);
});

/**
 * @desc   AI usage summary
 * @route  GET /api/admin/analytics/ai-usage
 * @access Private (Admin)
 */
const getAiUsageSummary = asyncHandler(async (req, res) => {
  const aiSources = await Promise.all([
    LessonNote.aggregate([{ $group: { _id: '$aiProvider', count: { $sum: 1 } } }]),
    Quiz.aggregate([{ $group: { _id: '$aiProvider', count: { $sum: 1 } } }]),
    LearnerNote.aggregate([{ $group: { _id: '$aiProvider', count: { $sum: 1 } } }]),
  ]);

  const merged = {};
  aiSources.flat().forEach((item) => {
    if (!item._id) return;
    merged[item._id] = (merged[item._id] || 0) + item.count;
  });

  res.json({
    totalByProvider: merged,
    totalGenerated: Object.values(merged).reduce((a, b) => a + b, 0),
  });
});

/**
 * @desc   AI-generated admin insights report
 * @route  GET /api/admin/analytics/insights
 * @access Private (Admin)
 */
const getAiAnalyticsInsights = asyncHandler(async (req, res) => {
  const [teacherCount, studentCount, schoolCount, avgQuizScore, aiUsage] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    School.countDocuments(),
    QuizAttempt.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } },
        },
      },
    ]),
    LessonNote.aggregate([{ $group: { _id: '$aiProvider', count: { $sum: 1 } } }]),
  ]);

  const stats = {
    teacherCount,
    studentCount,
    schoolCount,
    avgScore: avgQuizScore[0]?.avgScore?.toFixed(1) || 0,
    aiUsage,
  };

  const prompt = `
You are an education data analyst for "Scholars Path".
Analyze this JSON data and write a 6–8 sentence report summarizing platform trends.

Data:
${JSON.stringify(stats, null, 2)}

Include:
- Engagement comparison (teachers vs students)
- AI provider dominance
- Student performance insights
- One actionable recommendation
Use a professional Ghanaian educational tone.
`;

  try {
    const { text, provider, model } = await aiService.generateTextCore({
      prompt,
      task: 'adminInsightSummary',
      temperature: 0.45,
      preferredProvider: 'perplexity',
    });

    res.json({
      summary: text.trim(),
      provider,
      model,
      rawStats: stats,
    });
  } catch (err) {
    console.error('AI insight generation failed:', err.message);
    res.json({
      summary:
        'Engagement remains balanced across teachers and students. AI usage shows consistent adoption. Student quiz performance is steady. Recommended: focus on lesson quality reviews to improve average scores.',
      provider: 'fallback',
      rawStats: stats,
    });
  }
});

module.exports = {
  // Management
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent,

  // Analytics
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
  getAiUsageSummary,
  getAiAnalyticsInsights,
};
