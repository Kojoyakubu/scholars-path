const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  approveUser, 
  deleteUser, 
  getUsageStats, 
  createSchool, 
  deleteSchool,
  assignUserToSchool,
  getSchools
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

// User management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/assign-school', assignUserToSchool);

// Stats
router.get('/stats', getUsageStats);

// School management
router.post('/schools', createSchool);
router.get('/schools', getSchools);
router.delete('/schools/:id', deleteSchool);

module.exports = router;