import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useTheme,
  Avatar,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import QuizIcon from '@mui/icons-material/Quiz';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';

const drawerWidth = 240;

const Layout = ({ onLogout }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = user?.role?.toLowerCase();

    switch (role) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, link: '/admin/dashboard' },
          { text: 'Schools', icon: <SchoolIcon />, link: '/admin/schools' },
          { text: 'Teachers', icon: <GroupIcon />, link: '/admin/teachers' },
          { text: 'Students', icon: <PersonIcon />, link: '/admin/students' },
          { text: 'Quizzes', icon: <QuizIcon />, link: '/admin/quizzes' },
          { text: 'Resources', icon: <BookIcon />, link: '/admin/resources' },
          { text: 'Analytics', icon: <AssessmentIcon />, link: '/admin/analytics' },
        ];

      case 'teacher':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, link: '/teacher/dashboard' },
          { text: 'Lesson Notes', icon: <ArticleIcon />, link: '/teacher/notes' },
          { text: 'Learner Notes', icon: <BookIcon />, link: '/teacher/learner-notes' },
          { text: 'Quizzes', icon: <QuizIcon />, link: '/teacher/quizzes' },
          { text: 'Analytics', icon: <AssessmentIcon />, link: '/teacher/analytics' },
        ];

      case 'student':
      default:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard' },
          { text: 'My Notes', icon: <BookIcon />, link: '/student/notes' },
          { text: 'Quizzes', icon: <QuizIcon />, link: '/student/quizzes' },
          { text: 'Resources', icon: <FolderIcon />, link: '/student/resources' },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Get appropriate page title based on role
  const getPageTitle = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'student':
      default:
        return 'Student Dashboard';
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #02367B, #006CA5)',
        color: '#fff',
      }}
    >
      {/* Logo/Brand Section */}
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          Scholar's Path
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.link}
            onClick={() => setMobileOpen(false)} // Close mobile drawer on navigation
            sx={{
              mb: 0.5,
              mx: 1,
              borderRadius: 1,
              color: location.pathname === item.link ? '#55E2E9' : '#fff',
              backgroundColor: location.pathname === item.link ? 'rgba(85, 226, 233, 0.15)' : 'transparent',
              borderLeft: location.pathname === item.link ? '4px solid #55E2E9' : '4px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      {/* Logout Section */}
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{
            mx: 1,
            mb: 2,
            borderRadius: 1,
            color: '#ffcccc',
            '&:hover': {
              backgroundColor: 'rgba(255,100,100,0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#ffcccc', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ===== AppBar ===== */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #02367B, #006CA5, #0496C7)',
          color: '#fff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {/* Mobile Menu Toggle */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          {/* User Avatar & Menu */}
          <Tooltip title="Account">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar
                alt={user?.fullName || user?.name}
                src={user?.avatar || '/default-avatar.png'}
                sx={{
                  bgcolor: '#04BADE',
                  border: '2px solid #55E2E9',
                  width: 38,
                  height: 38,
                }}
              >
                {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Account Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
            }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onLogout();
              }}
              sx={{ color: '#E53935' }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ===== Drawer (Sidebar) ===== */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer (Temporary) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer (Permanent) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ===== Main Content Area ===== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* Toolbar spacer to push content below AppBar */}
        <Toolbar />
        
        {/* Child routes render here via <Outlet /> */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;