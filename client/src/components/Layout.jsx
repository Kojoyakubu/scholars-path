// /client/src/components/Layout.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem,
  ListItemIcon, ListItemText, CssBaseline, useTheme, Avatar, Divider, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import QuizIcon from '@mui/icons-material/Quiz';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'; // Example for future profile/settings
import NotificationsIcon from '@mui/icons-material/Notifications'; // Example for notifications

import { useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import logo from '/scholars-path-logo.png'; // Assuming your logo is here

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active link

  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  if (!user) {
    // If no user is logged in, render only the content that doesn't need the layout
    return <Outlet />;
  }

  // Define navigation items based on user role
  let navItems = [];
  if (user?.role === 'admin') {
    navItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
      { text: 'Manage Users', icon: <GroupIcon />, path: '/admin/users' },
      { text: 'Manage Schools', icon: <SchoolIcon />, path: '/admin/schools' },
      { text: 'Curriculum', icon: <BookIcon />, path: '/admin/curriculum' },
    ];
  } else if (user?.role === 'teacher' || user?.role === 'school_admin') {
    navItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher/dashboard' },
      { text: 'My Lesson Notes', icon: <Article />, path: '/teacher/lesson-notes' }, // Assuming this route exists
      { text: 'Quizzes', icon: <QuizIcon />, path: '/teacher/quizzes' }, // Assuming this route exists
      // Add more teacher-specific routes as needed
    ];
  } else if (user?.role === 'student') {
    navItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'My Progress', icon: <PersonIcon />, path: '/student/progress' }, // Example student route
      { text: 'Quiz History', icon: <QuizIcon />, path: '/student/quiz-history' }, // Example student route
    ];
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: theme.palette.background.paper }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, bgcolor: theme.palette.primary.main }}>
        <Box component={RouterLink} to={user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'}
             sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
          <img src={logo} alt="Scholar's Path Logo" style={{ height: 32, marginRight: 8 }} />
          <Typography variant="h6" noWrap component="div">
            Scholar's Path
          </Typography>
        </Box>
        <IconButton
          color="inherit"
          aria-label="close drawer"
          onClick={handleDrawerClose}
          sx={{ display: { sm: 'none' } }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              borderRadius: theme.shape.borderRadius,
              mx: 1,
              mb: 1,
              bgcolor: location.pathname === item.path ? theme.palette.primary.light : 'transparent',
              color: location.pathname === item.path ? theme.palette.primary.contrastText : theme.palette.text.primary,
              '&:hover': {
                bgcolor: location.pathname === item.path ? theme.palette.primary.dark : theme.palette.action.hover,
                color: location.pathname === item.path ? theme.palette.primary.contrastText : theme.palette.text.primary,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: theme.palette.background.paper, // White app bar
          color: theme.palette.text.primary, // Dark text
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Dynamically display current page title or a greeting */}
            Welcome, {user?.fullName || 'User'}!
          </Typography>
          <Tooltip title="Notifications"><IconButton color="inherit"><NotificationsIcon /></IconButton></Tooltip>
          <Tooltip title="Profile Settings"><IconButton color="inherit"><SettingsIcon /></IconButton></Tooltip>
          <Avatar alt={user?.fullName} src={user?.avatar || '/default-avatar.png'} sx={{ ml: 1, bgcolor: theme.palette.primary.light }} />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={document.body} // or specific container ref
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: `${theme.mixins.toolbar.minHeight}px`, // Offset for fixed app bar
        }}
      >
        <Outlet /> {/* This is where your actual page content will be rendered */}
      </Box>
    </Box>
  );
};

export default Layout;