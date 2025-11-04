// /client/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Clean modern look
    primary: {
      main: '#006CA5',   // Deep Ocean Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#04BADE',   // Aqua highlight
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4FBFF', // Soft sky blue background
      paper: '#FFFFFF',
    },
    success: {
      main: '#55E2E9',   // Bright accent blue
    },
    error: {
      main: '#E53935',
    },
    text: {
      primary: '#02367B',   // Navy text color
      secondary: '#006CA5',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#02367B',
    },
    h5: {
      fontWeight: 600,
      color: '#006CA5',
    },
    body1: {
      color: '#02367B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.3px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 18px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,108,165,0.25)',
            backgroundColor: '#0496C7',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 3px 8px rgba(2,54,123,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #02367B, #006CA5, #0496C7)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;
