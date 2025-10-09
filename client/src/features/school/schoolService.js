import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/school/';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get dashboard data for a specific school
const getSchoolDashboard = async (schoolId, token) => {
  const response = await axios.get(API_URL + `dashboard/${schoolId}`, getConfig(token));
  return response.data;
};

const schoolService = {
  getSchoolDashboard,
};

export default schoolService;