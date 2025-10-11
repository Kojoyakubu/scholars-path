// src/features/school/schoolService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

/**
 * Get dashboard data for a specific school.
 * The user's auth token is sent automatically by the axios interceptor.
 * @param {string} schoolId - The ID of the school to fetch data for.
 * @returns {Promise<object>} The dashboard data from the API.
 */
const getSchoolDashboard = async (schoolId) => {
  const response = await api.get(`/school/dashboard/${schoolId}`);
  return response.data;
};

const schoolService = {
  getSchoolDashboard,
};

export default schoolService;