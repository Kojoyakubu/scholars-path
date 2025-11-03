// src/features/admin/adminService.js
import api from '../../api/axios';

// ... (all your existing functions like getUsers, approveUser, etc. remain here)
const getUsers = async (pageNumber = 1) => {
  const response = await api.get(`/api/admin/users?pageNumber=${pageNumber}`);
  return response.data;
};

const approveUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/approve`);
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

const getStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

const getSchools = async () => {
  const response = await api.get('/api/admin/schools');
  return response.data;
};

const createSchool = async (schoolData) => {
  const response = await api.post('/api/admin/schools', schoolData);
  return response.data;
};

const deleteSchool = async (schoolId) => {
  const response = await api.delete(`/api/admin/schools/${schoolId}`);
  return response.data;
};

const assignUserToSchool = async (data) => {
  const { userId, schoolId } = data;
  const response = await api.put(`/api/admin/users/${userId}/assign-school`, { schoolId });
  return response.data;
};

const getAiInsights = async () => {
  const response = await api.get('/api/admin/analytics/insights');
  return response.data;
};

const getAnalyticsOverview = async () => {
  const response = await api.get('/api/admin/analytics/overview');
  return response.data;
};

const getTopTeachers = async () => {
  const response = await api.get('/api/admin/analytics/top-teachers');
  return response.data;
};

const getTopStudents = async () => {
  const response = await api.get('/api/admin/analytics/top-students');
  return response.data;
};

// ✨ NEW: Function to get curriculum levels
const getCurriculumLevels = async () => {
    const response = await api.get('/api/curriculum/levels');
    return response.data;
}


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
  getCurriculumLevels, // ✨ NEW
};

export default adminService;