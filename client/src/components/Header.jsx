import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

// --- MUI Imports ---
import { Box, Button, Link, Typography } from '@mui/material';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
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
      <Box 
        className='container' 
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
        <Box component="ul" sx={{ display: 'flex', listStyle: 'none', m: 0, p: 0, alignItems: 'center' }}>
          {user ? (
            <>
              {/* FIXED: Check for user existence before checking user.role */}
              {user && user.role === 'student' && (
                <li style={{ marginRight: '20px' }}>
                  <Button component={RouterLink} to="/my-badges">My Badges</Button>
                </li>
              )}
              <li>
                <Button variant="contained" onClick={onLogout}>
                  Logout
                </Button>
              </li>
            </>
          ) : (
            <>
              <li style={{ marginRight: '10px' }}>
                <Button component={RouterLink} to='/pricing'>Pricing</Button>
              </li>
              <li style={{ marginRight: '10px' }}>
                <Button component={RouterLink} to='/login'>Login</Button>
              </li>
              <li>
                <Button component={RouterLink} to='/register' variant="contained">Register</Button>
              </li>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Header;