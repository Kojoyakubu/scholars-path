// /server/routes/schoolRoutes.js
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSchoolSummary,
  getSchoolInsights,
  getSchoolDashboard, // if you already have a different summary method, map accordingly
} = require('../controllers/schoolController');

// Summary cards
router.get('/summary',  protect, authorize('school_admin', 'admin'), getSchoolSummary);

// AI insights for school view
router.get('/insights', protect, authorize('school_admin', 'admin'), getSchoolInsights);

// Optional: a dedicated dashboard endpoint if your controller exposes it
router.get('/dashboard', protect, authorize('school_admin', 'admin'), getSchoolDashboard);

module.exports = router;
