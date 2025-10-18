// /client/src/components/PrivateRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

/**
 * A route guard that checks if a user is authenticated.
 * 1. Shows a loading spinner while checking the auth state.
 * 2. If the user is logged in, it renders the child route (`<Outlet />`).
 * 3. If the user is not logged in, it redirects to the /login page.
 */
const PrivateRoute = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // The `replace` prop prevents the user from navigating back to the protected route after logging out.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;