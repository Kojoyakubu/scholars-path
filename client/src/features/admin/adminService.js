// src/features/admin/adminService.js
import api from '../../api/axios';

// Get all users with pagination
const getUsers = async (pageNumber = 1) => {
  const response = await api.get(`/api/admin/users?pageNumber=${pageNumber}`);
  return response.data;
};

// Approve a user
const approveUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/approve`);
  return response.data;
};

// Delete a user
const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

// Get usage statistics
const getStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

// Get all schools
const getSchools = async () => {
  const response = await api.get('/api/admin/schools');
  return response.data;
};

// Create a new school
const createSchool = async (schoolData) => {
  const response = await api.post('/api/admin/schools', schoolData);
  return response.data;
};

// Delete a school
const deleteSchool = async (schoolId) => {
  const response = await api.delete(`/api/admin/schools/${schoolId}`);
  return response.data;
};

// Assign user to school
const assignUserToSchool = async (data) => {
  const { userId, schoolId } = data;
  const response = await api.put(`/api/admin/users/${userId}/assign-school`, { schoolId });
  return response.data;
};

// 🧠 Get AI Insights
const getAiInsights = async () => {
  const response = await api.get('/api/admin/analytics/insights');
  return response.data;
};

// 📊 Get Analytics Overview
const getAnalyticsOverview = async () => {
  const response = await api.get('/api/admin/analytics/overview');
  return response.data;
};

// 🧑‍🏫 Get Top Teachers
const getTopTeachers = async () => {
  const response = await api.get('/api/admin/analytics/top-teachers');
  return response.data;
};

// 👩‍🎓 Get Top Students
const getTopStudents = async () => {
  const response = await api.get('/api/admin/analytics/top-students');
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
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
};

export default adminService;