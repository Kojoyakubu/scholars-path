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
  ListItemButton,
  CssBaseline,
  useTheme,
  Avatar,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
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

// ═══════════════════════════════════════════════════════════
// 🎨 DESIGN SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════

const DRAWER_WIDTH_EXPANDED = 240;  // Updated from 260
const DRAWER_WIDTH_COLLAPSED = 80;

// ═══════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS - REFINED DESIGN
// ═══════════════════════════════════════════════════════════

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid #E0E0E0',
  color: theme.palette.text.primary,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawerContent = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#FFFFFF',
  borderRight: '1px solid #E0E0E0',
}));

const StyledNavItem = styled(ListItemButton)(({ theme, active }) => ({
  marginBottom: 4,
  marginLeft: 8,
  marginRight: 8,
  borderRadius: 8,
  minHeight: 44,
  transition: 'all 0.2s ease',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  background: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateX(2px)',
  },
  
  '& .MuiListItemIcon-root': {
    color: 'inherit',
    minWidth: 40,
  },
  
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
  },
}));

// ═══════════════════════════════════════════════════════════
// 🎨 MAIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // 🎯 ROLE-BASED NAVIGATION - PRESERVED LOGIC
  // ═══════════════════════════════════════════════════════════

  const getMenuItems = () => {
    const role = user?.role?.toLowerCase();

    switch (role) {
      case 'admin':
        return [
          { text: 'Overview', icon: <DashboardIcon />, link: '/admin/dashboard' },
          { text: 'Users', icon: <GroupIcon />, link: '/admin/users' },
          { text: 'Schools', icon: <SchoolIcon />, link: '/admin/schools' },
          { text: 'Curriculum', icon: <BookIcon />, link: '/admin/curriculum' },
          { text: 'Analytics', icon: <AssessmentIcon />, link: '/admin/analytics' },
        ];

      case 'teacher':
        return [
          { text: 'Home', icon: <DashboardIcon />, link: '/teacher/dashboard' },
          { text: 'My Notes', icon: <ArticleIcon />, link: '/teacher/notes' },
          { text: 'Drafts', icon: <BookIcon />, link: '/teacher/drafts' },
          { text: 'Bundles', icon: <FolderIcon />, link: '/teacher/bundles' },
          { text: 'Analytics', icon: <AssessmentIcon />, link: '/teacher/analytics' },
        ];

      case 'student':
      default:
        return [
          { text: 'Home', icon: <DashboardIcon />, link: '/dashboard' },
          { text: 'My Subjects', icon: <BookIcon />, link: '/student/subjects' },
          { text: 'Quizzes', icon: <QuizIcon />, link: '/student/quizzes' },
          { text: 'Progress', icon: <AssessmentIcon />, link: '/student/progress' },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Get page title
  const getPageTitle = () => {
    const role = user?.role?.toLowerCase();
    const currentItem = menuItems.find(item => item.link === location.pathname);
    
    if (currentItem?.text) return currentItem.text;
    
    // Fallback based on role
    switch (role) {
      case 'admin': return 'Admin Dashboard';
      case 'teacher': return 'Teacher Dashboard';
      case 'student': return 'Student Dashboard';
      default: return 'Dashboard';
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 DRAWER CONTENT (SIDEBAR)
  // ═══════════════════════════════════════════════════════════

  const drawer = (
    <StyledDrawerContent>
      {/* Logo Section */}
      <Box
        sx={{
          px: collapsed ? 1.5 : 2,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Simple Logo Icon */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              S
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1rem' }}>
                Scholar's Path
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Learning Platform
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            S
          </Box>
        )}
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List component="nav">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.link || 
                           (item.link !== '/dashboard' && location.pathname.startsWith(item.link));
            
            return (
              <StyledNavItem
                key={index}
                component={RouterLink}
                to={item.link}
                active={isActive ? 1 : 0}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </StyledNavItem>
            );
          })}
        </List>
      </Box>

      {/* Collapse Toggle - Desktop Only */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          borderTop: '1px solid #E0E0E0',
          p: 1,
        }}
      >
        <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
          <IconButton
            onClick={handleCollapse}
            sx={{
              width: '100%',
              borderRadius: 2,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </StyledDrawerContent>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* ═══════════════════════════════════════════════════════════
          🎨 TOP BAR (APP BAR)
          ═══════════════════════════════════════════════════════════*/}
      
      <StyledAppBar position="fixed">
        <Toolbar>
          {/* Mobile Menu Icon */}
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
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
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
                  }}
                >
                  {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Account Menu */}
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
                  border: '1px solid #E0E0E0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E0E0E0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.fullName || user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.email}
                </Typography>
              </Box>
              
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
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
                  my: 0.5,
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
                  my: 0.5,
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
      </StyledAppBar>

      {/* ═══════════════════════════════════════════════════════════
          🎨 SIDEBAR (DRAWER)
          ═══════════════════════════════════════════════════════════*/}
      
      <Box
        component="nav"
        sx={{
          width: { sm: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease',
        }}
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
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
              width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
              border: 'none',
              transition: 'width 0.3s ease',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          🎨 MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════*/}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: {
            sm: `calc(100% - ${collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED}px)`,
          },
          minHeight: '100vh',
          background: '#F8FAFB',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Toolbar Spacer */}
        <Toolbar />

        {/* Page Content - Dashboards Render Here */}
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;