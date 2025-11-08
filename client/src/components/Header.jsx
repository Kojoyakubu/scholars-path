// /client/src/components/Header.jsx
// 🎨 Modernized Header - Following Design Blueprint
// Features: Glass morphism navbar, improved layout, smooth hover effects

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import {
  AppBar,
  Box,
  Button,
  Link,
  Toolbar,
  Typography,
  Container,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Select user from auth state (preserved logic)
  const user = useSelector((state) => state.auth.user);

  // Logout handler (preserved logic)
  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      component={motion.div}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      sx={{
        // Glass morphism effect
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo & Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: theme.palette.background.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: theme.palette.background.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Scholar's Path
              </Typography>
            </Box>
          </Box>

          {/* Navigation */}
          <Box component="nav">
            {user ? (
              // Logged-in User Navigation
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Student-specific: My Badges link */}
                {user.role === 'student' && (
                  <Button
                    component={RouterLink}
                    to="/my-badges"
                    startIcon={<EmojiEventsIcon />}
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    My Badges
                  </Button>
                )}

                {/* User Avatar */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    mx: 1,
                  }}
                >
                  {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                </Avatar>

                {/* Logout Button */}
                <Button
                  variant="outlined"
                  onClick={onLogout}
                  startIcon={<LogoutIcon />}
                  sx={{
                    borderWidth: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  Logout
                </Button>
              </Stack>
            ) : (
              // Non-logged-in User Navigation
              <Stack direction="row" spacing={2}>
                <Button
                  component={RouterLink}
                  to="/pricing"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Pricing
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;