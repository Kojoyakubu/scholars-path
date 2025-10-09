import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/admin/';

// Helper to get the auth config
const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get all users with pagination
const getUsers = async (pageNumber, token) => {
  const response = await axios.get(API_URL + `users?pageNumber=${pageNumber}`, getConfig(token));
  return response.data;
};

// Approve a user
const approveUser = async (userId, token) => {
    const response = await axios.put(API_URL + `users/${userId}/approve`, {}, getConfig(token));
    return response.data;
}

// Delete a user
const deleteUser = async (userId, token) => {
    await axios.delete(API_URL + `users/${userId}`, getConfig(token));
    return userId;
}

// Get usage stats
const getStats = async (token) => {
    const response = await axios.get(API_URL + 'stats', getConfig(token));
    return response.data;
}

// Get all schools
const getSchools = async (token) => {
    const response = await axios.get(API_URL + 'schools', getConfig(token));
    return response.data;
}

// Create a new school
const createSchool = async (schoolData, token) => {
    const response = await axios.post(API_URL + 'schools', schoolData, getConfig(token));
    return response.data;
}

// Delete a school
const deleteSchool = async (schoolId, token) => {
    await axios.delete(API_URL + `schools/${schoolId}`, getConfig(token));
    return schoolId;
}

// Assign a user to a school
const assignUserToSchool = async (data, token) => {
    const { userId, schoolId } = data;
    const response = await axios.put(API_URL + `users/${userId}/assign-school`, { schoolId }, getConfig(token));
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