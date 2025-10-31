// src/features/admin/adminService.js
import api from '../../api/axios'; // Centralized Axios instance

// Get all users with pagination
const getUsers = async (pageNumber = 1) => {
  const response = await api.get(`/admin/users?pageNumber=${pageNumber}`);
  return response.data;
};

// Approve a user
const approveUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/approve`);
  return response.data;
};

// Delete a user
const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get usage statistics
const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Get all schools
const getSchools = async () => {
  const response = await api.get('/admin/schools');
  return response.data;
};

// Create a new school
const createSchool = async (schoolData) => {
  const response = await api.post('/admin/schools', schoolData);
  return response.data;
};

// Delete a school
const deleteSchool = async (schoolId) => {
  const response = await api.delete(`/admin/schools/${schoolId}`);
  return response.data;
};

// Assign user to school
const assignUserToSchool = async (data) => {
  const { userId, schoolId } = data;
  const response = await api.put(`/admin/users/${userId}/assign-school`, { schoolId });
  return response.data;
};

// 🧠 Get AI Insights (for Admin Dashboard)
const getAiInsights = async () => {
  const response = await api.get('/admin/ai-insights');
  return response.data;
};

const adminService = {
  getUsers,
  approveUser,
  deleteUser,
  getStats,
  getSchools,
  createSchool,
  deleteSchool,
  assignUserToSchool,
  getAiInsights,
};

export default adminService;
