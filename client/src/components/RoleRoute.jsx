// /client/src/components/RoleRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A route guard that checks if an authenticated user has the required role.
 * This component should be nested inside a <PrivateRoute>.
 * 1. If the user has an allowed role, it renders the child route (`<Outlet />`).
 * 2. If the user is logged in but lacks the role, it redirects to the homepage.
 */
const RoleRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    // This case should ideally not be hit if nested in a PrivateRoute, but it's a good safeguard.
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is included in the array of allowed roles.
  return allowedRoles?.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default RoleRoute;