import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const SchoolAdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  // Allow access if the user is a top-level admin OR a school_admin
  return (user && (user.role === 'admin' || user.role === 'school_admin')) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default SchoolAdminRoute;