import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  // We can assume isLoading is handled by a parent PrivateRoute,
  // so we only need to check the user's role here.
  
  if (user && allowedRoles?.includes(user.role)) {
    return <Outlet />; // If authorized, show the nested page
  } else if (user) {
    // If user is logged in but not authorized, send them home
    return <Navigate to="/" replace />; 
  } else {
    // If for some reason there's no user, send to login
    return <Navigate to="/login" replace />;
  }
};

export default RoleRoute;