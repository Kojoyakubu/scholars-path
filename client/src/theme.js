// /client/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark' if you want deep contrast
    primary: {
      main: '#1E8449',   // Rich forest green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#145A32',   // Deeper earthy tone
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FBE7', // Soft natural background
      paper: '#F1F8E9',
    },
    success: {
      main: '#28B463',   // Consistent with AuthPortal button
    },
    error: {
      main: '#C0392B',
    },
    text: {
      primary: '#1B2631',  // Deep ink color
      secondary: '#2E4053',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#145A32',
    },
    h5: {
      fontWeight: 600,
      color: '#1E8449',
    },
    body1: {
      color: '#2E4053',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(20,90,50,0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
