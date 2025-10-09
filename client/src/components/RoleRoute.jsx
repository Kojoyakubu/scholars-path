import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  // This component will run inside a PrivateRoute, so we can assume 'user' exists.
  // We check if the user's role is included in the list of allowed roles.
  if (user && allowedRoles?.includes(user.role)) {
    return <Outlet />; // If authorized, show the nested page
  } else {
    // Redirect to home page if they are logged in but not authorized
    return <Navigate to="/" replace />; 
  }
};

export default RoleRoute;