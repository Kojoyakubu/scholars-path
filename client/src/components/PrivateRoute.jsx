import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // If user is logged in, show the page. Otherwise, redirect to login.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;