// /server/controllers/adminController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const School = require('../models/schoolModel');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const QuizAttempt = require('../models/quizAttemptModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const Subscription = require('../models/subscriptionModel');
const aiService = require('../services/aiService');

/* ============================================================================
 * USERS (generic)
 * ============================================================================
 */

// GET /api/admin/users  ?pageNumber=1&status=pending
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const filter = req.query.status ? { status: req.query.status } : {};

  const count = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('school', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-password');

  res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
});

// PUT /api/admin/users/:id/approve
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: `User ${user.fullName} has been approved.`, user });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete an admin user.');
  }
  await user.deleteOne();
  res.json({ message: 'User removed successfully.' });
});

/* ============================================================================
 * TEACHERS / STUDENTS via User model
 * ============================================================================
 */

// GET /api/admin/teachers
const getAllTeachers = asyncHandler(async (_req, res) => {
  const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 }).select('-password');
  res.json(teachers);
});

// GET /api/admin/students
const getAllStudents = asyncHandler(async (_req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 }).select('-password');
  res.json(students);
});

// DELETE /api/admin/teachers/:id  (cascade + AI audit)
const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid teacher ID.');
  }

  const teacher = await User.findOne({ _id: id, role: 'teacher' });
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found.');
  }

  const [lessonNotes, quizzes] = await Promise.all([
    LessonNote.deleteMany({ teacher: id }),
    Quiz.deleteMany({ teacher: id }),
  ]);

  await teacher.deleteOne();

  let aiAudit = '';
  try {
    const prompt = `
You are a digital education auditor.
Generate a one-line summary describing the deletion of a teacher account.

Details:
- Teacher Name: ${teacher.fullName || 'N/A'}
- Total Lesson Notes Deleted: ${lessonNotes.deletedCount}
- Total Quizzes Deleted: ${quizzes.deletedCount}

Keep it concise and formal.
`;
    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'deleteTeacherAudit',
      temperature: 0.4,
    });
    aiAudit = (text || '').trim();
  } catch (_e) {
    aiAudit = 'Teacher deleted successfully with associated records removed.';
  }

  res.json({ message: 'Teacher deleted successfully.', audit: aiAudit });
});

// DELETE /api/admin/students/:id  (cascade + AI audit)
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid student ID.');
  }

  const student = await User.findOne({ _id: id, role: 'student' });
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

  let aiAudit = '';
  try {
    const prompt = `
You are a system audit assistant.
Write a one-line report about a student account removal.

Data:
- Student Name: ${student.fullName || 'N/A'}
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
    aiAudit = (text || '').trim();
  } catch (_e) {
    aiAudit = 'Student deleted successfully with related data removed.';
  }

  res.json({ message: 'Student deleted successfully.', audit: aiAudit });
});

/* ============================================================================
 * SCHOOLS & ASSIGNMENTS
 * ============================================================================
 */

// ✅ FIXED VERSION: Create school and admin properly
const createSchool = asyncHandler(async (req, res) => {
  const { name, adminName, adminEmail, adminPassword } = req.body;

  if (!name || !adminName || !adminEmail || !adminPassword) {
    res.status(400);
    throw new Error('All fields are required: name, adminName, adminEmail, adminPassword.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingSchool = await School.findOne({ name }).session(session);
    if (existingSchool) throw new Error('A school with this name already exists.');

    const existingAdmin = await User.findOne({ email: adminEmail }).session(session);
    if (existingAdmin) throw new Error('This admin email is already in use.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 🧩 Create the admin first
    const [adminUser] = await User.create(
      [
        {
          fullName: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          status: 'approved',
        },
      ],
      { session }
    );

    // 🧩 Then create the school with admin reference
    const [createdSchool] = await School.create(
      [
        {
          name,
          admin: adminUser._id,
          contactEmail: adminEmail,
        },
      ],
      { session }
    );

    // 🧩 Finally link school to admin
    adminUser.school = createdSchool._id;
    await adminUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'School and admin user created successfully.',
      school: createdSchool,
      admin: adminUser,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(err.message || 'Failed to create school.');
  }
});

// GET /api/admin/schools
const getSchools = asyncHandler(async (_req, res) => {
  const schools = await School.find().populate('admin', 'fullName email').lean();
  res.json(schools);
});

// DELETE /api/admin/schools/:id
const deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  await User.updateMany({ school: school._id }, { $set: { school: null } });
  await school.deleteOne();

  res.json({ message: 'School deleted successfully.' });
});

// PUT /api/admin/users/:id/assign-school
const assignUserToSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.body;

  const [user, school] = await Promise.all([
    User.findById(id),
    School.findById(schoolId),
  ]);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  user.school = school._id;
  await user.save();

  res.json({ message: `Assigned ${user.fullName} to ${school.name}.`, user });
});

/* ============================================================================
 * ANALYTICS & INSIGHTS
 * ============================================================================
 */

// (Your analytics and insights functions remain exactly the same)
const getUsageStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalSchools, totalQuizAttempts, pendingUsers] = await Promise.all([
    User.countDocuments({}),
    School.countDocuments({}),
    QuizAttempt.countDocuments({}),
    User.countDocuments({ status: 'pending' }),
  ]);
  res.json({ totalUsers, totalSchools, totalQuizAttempts, pendingUsers });
});

const getAnalyticsOverview = asyncHandler(async (_req, res) => {
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

const getTopTeachers = asyncHandler(async (_req, res) => {
  const teachers = await LessonNote.aggregate([
    { $group: { _id: '$teacher', totalNotes: { $sum: 1 } } },
    { $sort: { totalNotes: -1 } },
    { $limit: 5 },
  ]);
  const populated = await User.populate(teachers, { path: '_id', select: 'fullName name email role school' });
  res.json(populated);
});

const getTopStudents = asyncHandler(async (_req, res) => {
  const students = await QuizAttempt.aggregate([
    {
      $match: { totalQuestions: { $gt: 0 } },
    },
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
  const populated = await User.populate(students, { path: '_id', select: 'fullName name email role school' });
  res.json(populated);
});

const getAiUsageSummary = asyncHandler(async (_req, res) => {
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

const getAiAnalyticsInsights = asyncHandler(async (_req, res) => {
  try {
    const [teacherCount, studentCount, schoolCount, avgQuizScoreResult, aiUsage, totalQuizAttempts] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      School.countDocuments(),
      QuizAttempt.aggregate([
        { $match: { totalQuestions: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgScore: {
              $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] },
            },
          },
        },
      ]),
      LessonNote.aggregate([{ $group: { _id: '$aiProvider', count: { $sum: 1 } } }]),
      QuizAttempt.countDocuments(),
    ]);

    const stats = {
      teacherCount,
      studentCount,
      schoolCount,
      avgScore: avgQuizScoreResult[0]?.avgScore?.toFixed(1) || '0',
      totalQuizAttempts,
      aiUsage,
    };

    const prompt = `
You are an education data analyst for Scholar's Path, a Ghanaian educational platform.
Analyze this JSON data and write a 6–8 sentence report summarizing platform trends.

Data:
${JSON.stringify(stats, null, 2)}

Include engagement comparison, AI usage, student performance, and one actionable recommendation.
`;

    try {
      const { text, provider, model } = await aiService.generateTextCore({
        prompt,
        task: 'adminInsightSummary',
        temperature: 0.45,
        preferredProvider: 'perplexity',
      });

      res.json({ summary: (text || '').trim(), provider, model, rawStats: stats });
    } catch (aiErr) {
      console.error('AI insight generation failed:', aiErr.message);
      res.json({
        summary: `Platform Overview: Scholar's Path currently serves ${teacherCount} teachers and ${studentCount} students across ${schoolCount} schools. Average quiz performance is ${stats.avgScore}%. AI tools continue to empower teachers. Recommendation: Increase student engagement through interactive learning.`,
        provider: 'fallback',
        model: 'static',
        rawStats: stats,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate analytics insights', error: err.message });
  }
});

module.exports = {
  getUsers,
  approveUser,
  deleteUser,
  assignUserToSchool,
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent,
  createSchool,
  getSchools,
  deleteSchool,
  getUsageStats,
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
  getAiUsageSummary,
  getAiAnalyticsInsights,
};
