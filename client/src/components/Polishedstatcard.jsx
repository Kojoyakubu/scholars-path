// /client/src/components/PolishedStatCard.jsx
// 🎨 Polished Stat Card - Matches AdminDashboard Design
// Features: Gradient backgrounds, icon boxes with shadows, hover effects, trend badges

import React from 'react';
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const PolishedStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = '#2196F3',
  subtitle,
  trend,
  onClick,
  delay = 0,
}) => {
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        y: -8,
        boxShadow: `0 12px 32px ${alpha(color, 0.25)}`,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      sx={{
        height: 180,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: `linear-gradient(135deg, 
          ${alpha(color, 0.08)} 0%, 
          ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Corner decoration
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: `radial-gradient(circle at top right, 
            ${alpha(color, 0.15)} 0%, 
            transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', position: 'relative', zIndex: 1 }}>
        {/* Top Row: Icon and Trend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          {/* Gradient Icon Box */}
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, 
                ${color} 0%, 
                ${alpha(color, 0.8)} 100%)`,
              boxShadow: `0 8px 24px ${alpha(color, 0.35)}`,
              color: 'white',
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          
          {/* Trend Badge */}
          {trend && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(trend.color || '#4CAF50', 0.12),
                border: `1px solid ${alpha(trend.color || '#4CAF50', 0.25)}`,
                color: trend.color || '#4CAF50',
                fontSize: '0.8rem',
                fontWeight: 700,
                height: 'fit-content',
              }}
            >
              {trend.value}
            </Box>
          )}
        </Box>
        
        {/* Value - Large Bold Number */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: color,
            fontSize: '2.25rem',
            letterSpacing: '-0.02em',
            mb: 0.5,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        
        {/* Label - Uppercase */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </Typography>
        
        {/* Subtitle - Optional small text */}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mt: 0.5,
              display: 'block',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PolishedStatCard;