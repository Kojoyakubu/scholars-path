import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is logged in and if their role is 'admin'
  if (user && user.role === 'admin') {
    return <Outlet />; // If yes, show the page they are trying to access
  } else {
    return <Navigate to="/login" replace />; // If no, redirect them to the login page
  }
};

export default AdminRoute;