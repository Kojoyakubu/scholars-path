// /client/src/components/DashboardBanner.jsx
// Unified Dashboard Banner for Student, Teacher, and Admin roles

import { Box, Paper, Typography, Avatar, Stack, IconButton, Chip, alpha, useTheme, ButtonGroup, Button } from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const DashboardBanner = ({ 
  user, 
  role, // 'student', 'teacher', 'admin'
  stats = [], // Array of { label, value, icon } for inline stats
  onRefresh,
  refreshing,
  collapsed,
  onCollapse,
  actions, // Optional extra actions/filters for admin
}) => {
  const theme = useTheme();
  
  // Role-specific greeting and subtitle
  const greetingConfig = {
    student: {
      title: (name) => `Welcome back, ${name}! 📚`,
      subtitle: "Continue your learning journey",
    },
    teacher: {
      title: (name) => `Welcome, ${name}! 👨‍🏫`,
      subtitle: "Create and manage your teaching materials",
    },
    admin: {
      title: () => `Admin Overview`,
      subtitle: (name) => `Welcome back, ${name} 👋`,
    }
  };
  
  const config = greetingConfig[role] || greetingConfig.student;
  const displayName = user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User';
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ mb: 3 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 3, md: 4 },
          p: { xs: 2.5, md: 3 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
          // Consistent decorative elements
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.05),
            top: '-150px',
            right: '-50px',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            {/* Left: Avatar + Text */}
            <Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: 0, flex: 1 }}>
              {!collapsed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 64, md: 80 },
                      height: { xs: 64, md: 80 },
                      bgcolor: alpha('#FFFFFF', 0.2),
                      border: `3px solid ${alpha('#FFFFFF', 0.4)}`,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {(user?.name || user?.fullName || 'U')[0].toUpperCase()}
                  </Avatar>
                </motion.div>
              )}
              
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant={collapsed ? 'h5' : 'h4'}
                  sx={{
                    fontWeight: 800,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    mb: collapsed ? 0 : 0.5,
                    fontSize: { xs: collapsed ? '1.25rem' : '1.5rem', md: collapsed ? '1.5rem' : '2rem' },
                  }}
                >
                  {typeof config.title === 'function' ? config.title(displayName) : config.title}
                </Typography>
                {!collapsed && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                    }}
                  >
                    {typeof config.subtitle === 'function' ? config.subtitle(displayName) : config.subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>
            
            {/* Right: Stats/Actions + Controls */}
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1.5} 
              flexWrap="wrap"
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              {/* Role-specific inline stats (for student/teacher) */}
              {!collapsed && stats.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <Chip
                        key={idx}
                        icon={StatIcon ? <StatIcon sx={{ fontSize: '1rem' }} /> : undefined}
                        label={`${stat.value} ${stat.label}`}
                        sx={{
                          bgcolor: alpha('#FFFFFF', 0.15),
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha('#FFFFFF', 0.25)}`,
                          height: 32,
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
              
              {/* Admin-specific actions */}
              {actions}
              
              {/* Common controls */}
              <Stack direction="row" spacing={1}>
                {onRefresh && (
                  <IconButton 
                    onClick={onRefresh}
                    disabled={refreshing}
                    sx={{ 
                      color: 'white',
                      bgcolor: alpha('#FFFFFF', 0.1),
                      '&:hover': { bgcolor: alpha('#FFFFFF', 0.2) },
                    }}
                  >
                    <RefreshIcon 
                      sx={{ 
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          from: { transform: 'rotate(0deg)' },
                          to: { transform: 'rotate(360deg)' },
                        }
                      }} 
                    />
                  </IconButton>
                )}
                
                {onCollapse && (
                  <IconButton
                    onClick={() => onCollapse(!collapsed)}
                    sx={{ 
                      color: 'white',
                      bgcolor: alpha('#FFFFFF', 0.1),
                      '&:hover': { bgcolor: alpha('#FFFFFF', 0.2) },
                    }}
                  >
                    {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardBanner;