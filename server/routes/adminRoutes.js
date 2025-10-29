// /server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent,
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
  getAiUsageSummary,
  getAiAnalyticsInsights,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================================================
// 🧑‍💼 ADMIN MANAGEMENT ROUTES
// ============================================================================

// Get all teachers
// GET /api/admin/teachers
router.get('/teachers', protect, authorize('admin', 'school_admin'), getAllTeachers);

// Get all students
// GET /api/admin/students
router.get('/students', protect, authorize('admin', 'school_admin'), getAllStudents);

// Delete a teacher
// DELETE /api/admin/teachers/:id
router.delete('/teachers/:id', protect, authorize('admin', 'school_admin'), deleteTeacher);

// Delete a student
// DELETE /api/admin/students/:id
router.delete('/students/:id', protect, authorize('admin', 'school_admin'), deleteStudent);

// ============================================================================
// 📊 ANALYTICS ROUTES
// ============================================================================

// Platform overview
// GET /api/admin/analytics/overview
router.get('/analytics/overview', protect, authorize('admin', 'school_admin'), getAnalyticsOverview);

// Top performing teachers
// GET /api/admin/analytics/top-teachers
router.get('/analytics/top-teachers', protect, authorize('admin', 'school_admin'), getTopTeachers);

// Top performing students
// GET /api/admin/analytics/top-students
router.get('/analytics/top-students', protect, authorize('admin', 'school_admin'), getTopStudents);

// AI usage breakdown
// GET /api/admin/analytics/ai-usage
router.get('/analytics/ai-usage', protect, authorize('admin', 'school_admin'), getAiUsageSummary);

// AI-generated platform insights
// GET /api/admin/analytics/insights
router.get('/analytics/insights', protect, authorize('admin', 'school_admin'), getAiAnalyticsInsights);

module.exports = router;
