// /client/src/theme.js

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#3F51B5', // A strong, academic blue
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BCD4', // A vibrant, engaging teal/cyan
      light: '#5edbe6',
      dark: '#008ba3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA', // Very light grey, almost white for the main app background
      paper: '#FFFFFF',   // Pure white for cards, modals, etc.
    },
    text: {
      primary: '#212121', // Dark grey for primary text, good readability
      secondary: '#757575', // Lighter grey for secondary text
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      '@media (min-width:600px)': {
        fontSize: '4.5rem',
      },
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.8rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.8rem',
      '@media (min-width:600px)': {
        fontSize: '2.2rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.4rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.2rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Keep button text natural
    },
  },
  shape: {
    borderRadius: 12, // Slightly more rounded for a friendly, modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#3F51B5',
          '&:hover': {
            backgroundColor: '#303f9f',
          },
        },
        containedSecondary: {
          backgroundColor: '#00BCD4',
          '&:hover': {
            backgroundColor: '#0097a7',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)', // More pronounced shadow for cards
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Often good for AppBars within a dashboard layout
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: '0 12px 12px 0', // Rounded only on the visible edge
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          fontSize: '0.8rem',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme); // Make font sizes responsive

export { theme };