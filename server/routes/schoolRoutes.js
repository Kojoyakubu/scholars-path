const express = require('express');
const router = express.Router();
const { getSchoolDashboard } = require('../controllers/schoolController');
const { protect } = require('../middleware/authMiddleware');
// We can create a more specific 'schoolAdmin' middleware later if needed

router.get('/dashboard/:schoolId', protect, getSchoolDashboard);

module.exports = router;