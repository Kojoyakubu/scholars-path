import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

// --- MUI Imports ---
import { Box, Button, Link, Typography, Container } from '@mui/material';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    // No need to dispatch reset() here, it's handled in the logout thunk's extraReducer
    navigate('/login');
  };
  
  const navItemStyles = {
    ml: 2, // Use theme spacing for margin
  };

  return (
    <Box 
      component="header" 
      sx={{ 
        width: '100%', 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: 'background.paper' 
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1.5,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            <Link component={RouterLink} to='/' underline="none" color="inherit">
              Scholar's Path
            </Link>
          </Typography>
          <Box component="nav" sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <>
                {/* Cleaner check with optional chaining */}
                {user?.role === 'student' && (
                  <Button component={RouterLink} to="/my-badges" sx={navItemStyles}>
                    My Badges
                  </Button>
                )}
                <Button variant="contained" onClick={onLogout} sx={navItemStyles}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to='/pricing' sx={navItemStyles}>
                  Pricing
                </Button>
                <Button component={RouterLink} to='/login' sx={navItemStyles}>
                  Login
                </Button>
                <Button component={RouterLink} to='/register' variant="contained" sx={navItemStyles}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Header;