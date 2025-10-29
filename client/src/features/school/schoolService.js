// src/features/school/schoolService.js
import api from '../../api/axios';

const getSchoolDashboard = async (schoolId) => {
  const response = await api.get(`/school/dashboard/${schoolId}`);
  return response.data;
};

export default { getSchoolDashboard };
