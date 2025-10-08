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
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

// User management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.delete('/users/:id', deleteUser);

// Stats
router.get('/stats', getUsageStats);

// School management
router.post('/schools', createSchool);
router.delete('/schools/:id', deleteSchool);
router.put('/users/:id/assign-school', assignUserToSchool);
router.get('/schools', getSchools);


module.exports = router;