// src/features/admin/adminService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

// Get all users with pagination
const getUsers = async (pageNumber = 1) => {
  const response = await api.get(`/admin/users?pageNumber=${pageNumber}`);
  return response.data;
};

// Approve a user
const approveUser = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/approve`);
    return response.data;
}

// Delete a user
const deleteUser = async (userId) => {
    await api.delete(`/admin/users/${userId}`);
    return userId; // Return the ID for easy removal from state
}

// Get usage stats
const getStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
}

// Get all schools
const getSchools = async () => {
    const response = await api.get('/admin/schools');
    return response.data;
}

// Create a new school
const createSchool = async (schoolData) => {
    const response = await api.post('/admin/schools', schoolData);
    return response.data;
}

// Delete a school
const deleteSchool = async (schoolId) => {
    await api.delete(`/admin/schools/${schoolId}`);
    return schoolId; // Return the ID
}

// Assign a user to a school
const assignUserToSchool = async (data) => {
    const { userId, schoolId } = data;
    const response = await api.put(`/admin/users/${userId}/assign-school`, { schoolId });
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
};

export default adminService;