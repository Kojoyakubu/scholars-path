// src/features/school/schoolService.js
import api from '../../api/axios';

const getSchoolDashboard = async () => {
  const response = await api.get('/api/school/dashboard');
  return response.data;
};

export default { getSchoolDashboard };
