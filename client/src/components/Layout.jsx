import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
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
// 🎨 DESIGN CONSTANTS
// ═══════════════════════════════════════════════════════════

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 80;

// Color scheme - Dark blue professional theme
const TOPBAR_BG = '#1E293B';      // Slate 800
const SIDEBAR_BG = '#0F172A';     // Slate 900
const ACCENT_COLOR = '#3B82F6';   // Blue 500

// ═══════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: TOPBAR_BG,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawerContent = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: SIDEBAR_BG,
}));

const StyledNavItem = styled(ListItemButton)(({ theme, active }) => ({
  marginBottom: 4,
  marginLeft: 8,
  marginRight: 8,
  borderRadius: 8,
  minHeight: 44,
  transition: 'all 0.2s ease',
  color: active ? '#FFFFFF' : alpha('#FFFFFF', 0.7),
  background: active ? alpha(ACCENT_COLOR, 0.15) : 'transparent',
  borderLeft: active ? `3px solid ${ACCENT_COLOR}` : '3px solid transparent',
  
  '&:hover': {
    background: active ? alpha(ACCENT_COLOR, 0.2) : alpha('#FFFFFF', 0.05),
    transform: 'translateX(2px)',
    color: '#FFFFFF',
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
  const navigate = useNavigate();
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
  // 🎯 ROLE-BASED NAVIGATION (FIXED ROUTING)
  // ═══════════════════════════════════════════════════════════

  const getMenuItems = () => {
    const role = user?.role?.toLowerCase();

    switch (role) {
      case 'admin':
        return [
          { text: 'Overview', icon: <DashboardIcon />, path: '/admin/dashboard' },
          { text: 'Users', icon: <GroupIcon />, path: '/admin/users' },
          { text: 'Schools', icon: <SchoolIcon />, path: '/admin/schools' },
          { text: 'Curriculum', icon: <BookIcon />, path: '/admin/curriculum' },
          { text: 'Analytics', icon: <AssessmentIcon />, path: '/admin/analytics' },
        ];

      case 'teacher':
        return [
          { text: 'Home', icon: <DashboardIcon />, path: '/teacher/dashboard' },
          { text: 'My Notes', icon: <ArticleIcon />, path: '/teacher/notes' },
          { text: 'Drafts', icon: <BookIcon />, path: '/teacher/drafts' },
          { text: 'Bundles', icon: <FolderIcon />, path: '/teacher/bundles' },
          { text: 'Analytics', icon: <AssessmentIcon />, path: '/teacher/analytics' },
        ];

      case 'student':
      default:
        return [
          { text: 'Home', icon: <DashboardIcon />, path: '/dashboard' },
          { text: 'My Subjects', icon: <BookIcon />, path: '/student/subjects' },
          { text: 'Quizzes', icon: <QuizIcon />, path: '/student/quizzes' },
          { text: 'Progress', icon: <AssessmentIcon />, path: '/student/progress' },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Get page title
  const getPageTitle = () => {
    const role = user?.role?.toLowerCase();
    const currentItem = menuItems.find(item => item.path === location.pathname);
    
    if (currentItem?.text) return currentItem.text;
    
    switch (role) {
      case 'admin': return 'Admin Dashboard';
      case 'teacher': return 'Teacher Dashboard';
      case 'student': return 'Student Dashboard';
      default: return 'Dashboard';
    }
  };

  // Handle navigation click
  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
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
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
        }}
      >
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Logo Icon */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #2563EB 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: `0 4px 12px ${alpha(ACCENT_COLOR, 0.4)}`,
              }}
            >
              S
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1rem', color: 'white' }}>
                Scholar's Path
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.6), fontSize: '0.7rem' }}>
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
              background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #2563EB 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: `0 4px 12px ${alpha(ACCENT_COLOR, 0.4)}`,
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
            const isActive = location.pathname === item.path || 
                           (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <StyledNavItem
                key={index}
                active={isActive ? 1 : 0}
                onClick={() => handleNavClick(item.path)}
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
          borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
          p: 1,
        }}
      >
        <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
          <IconButton
            onClick={handleCollapse}
            sx={{
              width: '100%',
              borderRadius: 2,
              color: alpha('#ffffff', 0.7),
              '&:hover': {
                background: alpha('#ffffff', 0.05),
                color: '#ffffff',
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
          🎨 TOP BAR (APP BAR) - DARK BLUE
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
              color: 'white',
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
                  color: alpha('#ffffff', 0.9),
                  '&:hover': {
                    background: alpha('#ffffff', 0.1),
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
                    border: `2px solid ${ACCENT_COLOR}`,
                    boxShadow: `0 0 0 2px ${alpha(ACCENT_COLOR, 0.2)}`,
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
                    background: alpha(ACCENT_COLOR, 0.08),
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
                    background: alpha(ACCENT_COLOR, 0.08),
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
          🎨 SIDEBAR (DRAWER) - DARKER BLUE
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
            keepMounted: true,
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