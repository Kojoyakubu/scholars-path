// /server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  // Users & role-based management
  getUsers,
  approveUser,
  deleteUser,
  assignUserToSchool,

  // Teachers & Students
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent,

  // Schools
  createSchool,
  getSchools,
  deleteSchool,

  // Platform stats & analytics
  getUsageStats,
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
  getAiUsageSummary,
  getAiAnalyticsInsights,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

/* ============================================================================
 * USERS MANAGEMENT
 * ============================================================================
 */
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/approve', protect, authorize('admin'), approveUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/assign-school', protect, authorize('admin'), assignUserToSchool);

/* ============================================================================
 * TEACHERS & STUDENTS
 * ============================================================================
 */
router.get('/teachers', protect, authorize('admin', 'school_admin'), getAllTeachers);
router.get('/students', protect, authorize('admin', 'school_admin'), getAllStudents);
router.delete('/teachers/:id', protect, authorize('admin'), deleteTeacher);
router.delete('/students/:id', protect, authorize('admin'), deleteStudent);

/* ============================================================================
 * SCHOOLS MANAGEMENT
 * ============================================================================
 */
router.post('/schools', protect, authorize('admin'), createSchool);
router.get('/schools', protect, authorize('admin', 'school_admin'), getSchools);
router.delete('/schools/:id', protect, authorize('admin'), deleteSchool);

/* ============================================================================
 * PLATFORM STATS & ANALYTICS
 * ============================================================================
 */
router.get('/stats', protect, authorize('admin', 'school_admin'), getUsageStats);
router.get('/analytics/overview', protect, authorize('admin', 'school_admin'), getAnalyticsOverview);
router.get('/analytics/top-teachers', protect, authorize('admin', 'school_admin'), getTopTeachers);
router.get('/analytics/top-students', protect, authorize('admin', 'school_admin'), getTopStudents);
router.get('/analytics/ai-usage', protect, authorize('admin', 'school_admin'), getAiUsageSummary);
router.get('/analytics/insights', protect, authorize('admin', 'school_admin'), getAiAnalyticsInsights);

module.exports = router;
