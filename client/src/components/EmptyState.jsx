// /client/src/components/EmptyState.jsx
// Consistent empty state component for all dashboards

import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const theme = useTheme();
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        textAlign: 'center',
        py: { xs: 6, md: 8 },
        px: 3,
        borderRadius: 3,
        border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      {Icon && (
        <Icon 
          sx={{ 
            fontSize: { xs: 60, md: 80 }, 
            color: alpha(theme.palette.primary.main, 0.3),
            mb: 2 
          }} 
        />
      )}
      
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 3, 
          maxWidth: 500, 
          mx: 'auto',
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}
      >
        {description}
      </Typography>
      
      {(onAction || onSecondaryAction) && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {onAction && (
            <Button 
              variant="contained" 
              size="large"
              onClick={onAction}
              sx={{ minWidth: 140 }}
            >
              {actionLabel}
            </Button>
          )}
          {onSecondaryAction && (
            <Button 
              variant="outlined" 
              size="large"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;