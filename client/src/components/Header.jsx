// /client/src/components/Header.jsx
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { AppBar, Box, Button, Link, Toolbar, Typography, Container } from '@mui/material';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // For clarity, select the specific state you need
  const user = useSelector((state) => state.auth.user);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    // Use AppBar for a semantic header element with elevation
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            <Link component={RouterLink} to="/" underline="none" color="inherit">
              Scholar's Path 🚀
            </Link>
          </Typography>
          <Box component="nav">
            {user ? (
              <>
                {user.role === 'student' && (
                  <Button component={RouterLink} to="/my-badges" color="inherit">
                    My Badges
                  </Button>
                )}
                <Button variant="outlined" onClick={onLogout} sx={{ ml: 2 }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/pricing" color="inherit">
                  Pricing
                </Button>
                <Button component={RouterLink} to="/login" sx={{ ml: 2 }} color="inherit">
                  Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" sx={{ ml: 2 }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;