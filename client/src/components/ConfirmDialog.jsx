// /client/src/components/ConfirmDialog.jsx
// Consistent confirmation dialog for all destructive actions

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';

const ConfirmDialog = ({
  open,
  title,
  message,
  severity = 'warning', // 'warning' | 'info' | 'error'
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const theme = useTheme();
  
  const config = {
    warning: {
      icon: WarningIcon,
      color: theme.palette.warning.main,
    },
    error: {
      icon: ErrorIcon,
      color: theme.palette.error.main,
    },
    info: {
      icon: InfoIcon,
      color: theme.palette.info.main,
    },
  };
  
  const { icon: Icon, color } = config[severity] || config.warning;
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onCancel}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: { xs: '90%', sm: 400 },
          maxWidth: 500,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color, fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText sx={{ fontSize: '1rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button 
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'primary'}
          disabled={loading}
          autoFocus
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;