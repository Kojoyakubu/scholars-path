import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material'; // For loading spinner

const PrivateRoute = () => {
  // Destructure both user and isLoading from the auth state
  const { user, isLoading } = useSelector((state) => state.auth);

  // 1. If the auth state is still loading, show a spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. If not loading, check for user and render the appropriate component
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;