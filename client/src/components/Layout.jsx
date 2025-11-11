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
  Badge,
  Chip,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';

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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 80;

// Glassmorphism styled components
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  color: theme.palette.text.primary,
}));

const GlassDrawer = styled(Box)(({ theme, collapsed }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  marginBottom: 8,
  marginLeft: 12,
  marginRight: 12,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  background: active 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
    : 'transparent',
  border: active ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : '1px solid transparent',
  '&:hover': {
    background: active
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
    transform: 'translateX(4px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const Layout = ({ onLogout }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapse = () => setCollapsed(!collapsed);

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
    const currentItem = menuItems.find(item => item.link === location.pathname);
    return currentItem?.text || 'Dashboard';
  };

  const drawer = (
    <GlassDrawer collapsed={collapsed}>
      {/* Logo/Brand Section */}
      <Box
        sx={{
          px: collapsed ? 1.5 : 2,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 64,
        }}
      >
        {!collapsed ? (
          // Horizontal Logo when expanded
          <Box
            component="svg"
            width="220"
            height="55"
            viewBox="0 0 400 100"
            xmlns="http://www.w3.org/2000/svg"
            sx={{ ml: 1 }}
          >
            <defs>
              <linearGradient id="logoIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: theme.palette.primary.main, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: theme.palette.secondary.main, stopOpacity: 1 }} />
              </linearGradient>
              
              <linearGradient id="logoTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: theme.palette.primary.main, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
              </linearGradient>
              
              <linearGradient id="logoCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Icon Section */}
            <g transform="translate(50, 50)">
              <circle cx="0" cy="0" r="38" fill="url(#logoIconGrad)" opacity="0.1"/>
              <circle cx="0" cy="0" r="36" fill="url(#logoIconGrad)" opacity="0.08"/>
              
              <g transform="translate(-15, -5)">
                <path d="M 0 15 Q 7.5 10, 15 15 L 15 0 Q 7.5 -2, 0 0 Z" fill="url(#logoIconGrad)"/>
                <path d="M 15 15 Q 22.5 10, 30 15 L 30 0 Q 22.5 -2, 15 0 Z" fill="url(#logoIconGrad)" opacity="0.8"/>
                <line x1="15" y1="3" x2="15" y2="14" stroke="white" strokeWidth="0.5" opacity="0.4"/>
                <line x1="7.5" y1="5" x2="7.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
                <line x1="22.5" y1="5" x2="22.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
              </g>
              
              <g transform="translate(-10, -22)">
                <rect x="0" y="0" width="20" height="2" fill="url(#logoIconGrad)" rx="0.5"/>
                <path d="M 10 -5 L 16 -2.5 L 10 0 L 4 -2.5 Z" fill="url(#logoCapGrad)"/>
                <line x1="10" y1="-5" x2="13" y2="-8" stroke="url(#logoCapGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="13" cy="-8" r="1.5" fill="url(#logoCapGrad)"/>
              </g>
              
              <g transform="translate(8, 10)">
                <path d="M 0 0 Q 5 -10, 10 -18" 
                      stroke="url(#logoIconGrad)" 
                      strokeWidth="2.5" 
                      fill="none" 
                      strokeLinecap="round"
                      opacity="0.5"/>
                <circle cx="0" cy="0" r="2" fill="url(#logoIconGrad)" opacity="0.7"/>
                <circle cx="5" cy="-5" r="2" fill="url(#logoIconGrad)" opacity="0.7"/>
                <circle cx="8" cy="-12" r="1.5" fill="url(#logoIconGrad)" opacity="0.6"/>
              </g>
            </g>
            
            {/* Text Section */}
            <g transform="translate(110, 50)">
              <text x="0" y="0" 
                    fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif" 
                    fontSize="34" 
                    fontWeight="800" 
                    fill="url(#logoTextGrad)"
                    letterSpacing="-1">
                Scholar's Path
              </text>
              
              <text x="2" y="20" 
                    fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif" 
                    fontSize="11" 
                    fontWeight="600" 
                    fill={theme.palette.text.secondary}
                    letterSpacing="1">
                EMPOWERING EDUCATION
              </text>
            </g>
          </Box>
        ) : (
          // Icon only when collapsed
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />

      {/* User Profile Section */}
      {!collapsed && (
        <Box
          sx={{
            px: 2,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            alt={user?.fullName || user?.name}
            src={user?.avatar}
            sx={{
              width: 48,
              height: 48,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.fullName || user?.name || 'User'}
            </Typography>
            <Chip
              label={user?.role || 'Student'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
        </Box>
      )}

      {collapsed && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <Avatar
            alt={user?.fullName || user?.name}
            src={user?.avatar}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
          </Avatar>
        </Box>
      )}

      <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mb: 1 }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1, overflow: 'auto' }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={collapsed ? item.text : ''}
            placement="right"
            arrow
          >
            <StyledListItem
              button
              component={RouterLink}
              to={item.link}
              onClick={() => setMobileOpen(false)}
              active={location.pathname === item.link ? 1 : 0}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 0 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: collapsed ? 'auto' : 40,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </StyledListItem>
          </Tooltip>
        ))}
      </List>

      {/* Bottom Section */}
      <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
      <List sx={{ px: 1 }}>
        {/* Settings */}
        <Tooltip title={collapsed ? 'Settings' : ''} placement="right" arrow>
          <StyledListItem
            button
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.text.secondary,
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: 'center',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Settings"
                sx={{ color: theme.palette.text.secondary }}
              />
            )}
          </StyledListItem>
        </Tooltip>

        {/* Logout */}
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
          <StyledListItem
            button
            onClick={onLogout}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : 2,
              mb: 1,
              color: theme.palette.error.main,
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </StyledListItem>
        </Tooltip>

        {/* Collapse Toggle */}
        <Tooltip
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          placement="right"
          arrow
        >
          <StyledListItem
            button
            onClick={handleCollapse}
            sx={{
              justifyContent: 'center',
              px: 0,
              mb: 1,
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.text.secondary,
                minWidth: 'auto',
                justifyContent: 'center',
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </ListItemIcon>
          </StyledListItem>
        </Tooltip>
      </List>
    </GlassDrawer>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />

      {/* ===== AppBar ===== */}
      <GlassAppBar
        position="fixed"
        sx={{
          width: {
            sm: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)`,
          },
          ml: {
            sm: `${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Mobile Menu Toggle */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title */}
            <Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                {getPageTitle()}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Welcome back, {user?.fullName || user?.name || 'User'}! 👋
              </Typography>
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search */}
            <Tooltip title="Search">
              <IconButton
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar & Menu */}
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                <Avatar
                  alt={user?.fullName || user?.name}
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                elevation: 0,
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 200,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <PersonIcon fontSize="small" sx={{ mr: 1.5 }} /> Profile
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} /> Settings
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onLogout();
                }}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  color: theme.palette.error.main,
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </GlassAppBar>

      {/* ===== Drawer (Sidebar) ===== */}
      <Box
        component="nav"
        sx={{
          width: { sm: collapsed ? drawerWidthCollapsed : drawerWidthExpanded },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer (Temporary) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidthExpanded,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer (Permanent) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
              border: 'none',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
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
          width: {
            sm: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)`,
          },
          minHeight: '100vh',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />

        {/* Child routes render here */}
        <Box
          sx={{
            mt: 2,
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
            minHeight: 'calc(100vh - 140px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;