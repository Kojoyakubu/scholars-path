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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

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

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #02367B, #006CA5)',
        color: '#fff',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap>
          Scholar’s Path
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, link: '/admin/dashboard' },
          { text: 'Schools', icon: <SchoolIcon />, link: '/admin/schools' },
          { text: 'Teachers', icon: <GroupIcon />, link: '/admin/teachers' },
          { text: 'Students', icon: <PersonIcon />, link: '/admin/students' },
          { text: 'Quizzes', icon: <QuizIcon />, link: '/admin/quizzes' },
          { text: 'Resources', icon: <BookIcon />, link: '/admin/resources' },
        ].map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.link}
            sx={{
              color: location.pathname === item.link ? '#55E2E9' : '#fff',
              borderLeft: location.pathname === item.link ? '4px solid #55E2E9' : '4px solid transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{
            color: '#ffcccc',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#ffcccc' }}>
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
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Admin Dashboard
          </Typography>

          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar
                alt={user?.fullName}
                src={user?.avatar || '/default-avatar.png'}
                sx={{
                  bgcolor: '#04BADE',
                  border: '2px solid #55E2E9',
                  width: 38,
                  height: 38,
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Account Dropdown */}
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
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
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

      {/* ===== Main Content ===== */}
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
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
