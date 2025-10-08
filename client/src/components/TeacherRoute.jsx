import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const TeacherRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is logged in and if their role is 'teacher' or 'admin'
  if (user && (user.role === 'teacher' || user.role === 'admin')) {
    return <Outlet />; // If yes, show the page
  } else {
    return <Navigate to="/login" replace />; // If no, redirect to login
  }
};

export default TeacherRoute;