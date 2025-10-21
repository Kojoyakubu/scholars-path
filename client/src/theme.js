import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1', // A deeper, more professional blue
      light: '#5472d3',
      dark: '#002171',
    },
    secondary: {
      main: '#4DB6AC', // A calming teal for secondary actions
      light: '#82e9de',
      dark: '#00867d',
    },
    background: {
      default: '#F4F6F8', // A very light grey for the main background
      paper: '#FFFFFF',   // White for cards and surfaces
    },
    text: {
      primary: '#263238', // A dark grey for primary text, softer than black
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#263238',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners for a modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More readable button text
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 4px 20px rgba(13, 71, 161, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});