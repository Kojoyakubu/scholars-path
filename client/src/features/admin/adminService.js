// /client/src/features/admin/adminService.js
import axios from '../../api/axios'; // Your pre-configured axios instance

// Base URL for admin-related endpoints
const API_URL = '/admin/';

/**
 * @desc    Get dashboard statistics (total users, schools, etc.)
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async () => {
  const response = await axios.get(API_URL + 'stats');
  return response.data;
};

/**
 * @desc    Get a paginated list of all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async () => {
  // Assuming this endpoint returns a list of all users for the count
  const response = await axios.get(API_URL + 'users');
  return response.data;
};

/**
 * @desc    Get a list of all schools
 * @route   GET /api/admin/schools
 * @access  Private (Admin)
 */
const getAllSchools = async () => {
  const response = await axios.get(API_URL + 'schools');
  return response.data;
};

/**
 * @desc    Get all curriculum levels
 * @route   GET /api/curriculum/levels
 * @access  Private (Admin)
 */
const getCurriculumLevels = async () => {
  const response = await axios.get('/curriculum/levels');
  return response.data;
};


const adminService = {
  getAdminStats,
  getAllUsers,
  getAllSchools,
  getCurriculumLevels,
};

export default adminService;