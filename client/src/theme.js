// /client/src/theme.js
// 🎨 Enhanced Theme Based on Scholar's Path Design Blueprint
// Implements modern color system, typography, and component styles

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    
    // 🔵 Primary Blues (Educational Trust) - Updated per blueprint
    primary: {
      main: '#2563EB',      // Primary-500: Bright Blue - CTAs
      light: '#60A5FA',     // Primary-300: Sky Blue - Hover States
      dark: '#1E3A5F',      // Primary-700: Ocean Deep - Primary Actions
      contrastText: '#FFFFFF',
    },
    
    // 🟣 Secondary/Accent - Purple for AI Features
    secondary: {
      main: '#8B5CF6',      // Purple: Innovation - AI Features
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    
    // ✅ Success - Emerald for Achievement
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    
    // ⚠️ Warning - Amber for Attention
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    
    // ❌ Error - Red for Alerts
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    
    // ℹ️ Info - Using Primary Blue
    info: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1E3A5F',
      contrastText: '#FFFFFF',
    },
    
    // 🎨 Background System
    background: {
      default: '#F3F4F6',   // Gray-100: Subtle Backgrounds
      paper: '#FFFFFF',      // White: Cards & Surfaces
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', // Hero gradient
      aiGradient: 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)', // AI Feature gradient
    },
    
    // 📝 Text System (Neutrals)
    text: {
      primary: '#111827',    // Gray-900: Text Primary
      secondary: '#4B5563',  // Gray-600: Text Secondary
      disabled: '#9CA3AF',   // Gray-400: Disabled text
    },
    
    // 🔲 Divider
    divider: '#E5E7EB',      // Gray-200
    
    // 🎯 Custom colors for specific use cases
    custom: {
      navy: '#0A1628',       // Primary-900: Deep Navy for headers
      glass: 'rgba(255, 255, 255, 0.1)', // Glass morphism
      border: '#9CA3AF',     // Gray-400: Borders
      lightBg: '#DBEAFE',    // Primary-100: Light Sky backgrounds
    },
  },
  
  // 🔤 Typography System - Per Blueprint
  typography: {
    // Font families as specified
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    
    // Display font for headings
    h1: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '3rem',        // 48px
      lineHeight: '3.5rem',    // 56px
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#111827',
    },
    h2: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '2.25rem',     // 36px
      lineHeight: '2.75rem',   // 44px
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#111827',
    },
    h3: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '1.75rem',     // 28px
      lineHeight: '2.25rem',   // 36px
      fontWeight: 600,
      color: '#111827',
    },
    h4: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '1.25rem',     // 20px
      lineHeight: '1.75rem',   // 28px
      fontWeight: 600,
      color: '#111827',
    },
    h5: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '1.125rem',    // 18px
      lineHeight: '1.75rem',   // 28px
      fontWeight: 600,
      color: '#111827',
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSize: '1rem',        // 16px
      lineHeight: '1.5rem',    // 24px
      fontWeight: 600,
      color: '#111827',
    },
    
    // Body text
    body1: {
      fontSize: '1rem',        // 16px - Body default
      lineHeight: '1.5rem',    // 24px
      fontWeight: 400,
      color: '#111827',
    },
    body2: {
      fontSize: '0.875rem',    // 14px - Caption size
      lineHeight: '1.25rem',   // 20px
      fontWeight: 500,
      color: '#4B5563',
    },
    
    // Subtitle/Lead text
    subtitle1: {
      fontSize: '1.125rem',    // 18px - Body-L (Lead Text)
      lineHeight: '1.75rem',   // 28px
      fontWeight: 400,
      color: '#111827',
    },
    subtitle2: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: 500,
      color: '#4B5563',
    },
    
    // Button text
    button: {
      fontSize: '1rem',        // 16px
      fontWeight: 600,
      textTransform: 'none',   // Don't uppercase buttons
      letterSpacing: '0.01em',
    },
    
    // Caption/Meta
    caption: {
      fontSize: '0.875rem',    // 14px - Caption
      lineHeight: '1.25rem',   // 20px
      fontWeight: 500,
      color: '#4B5563',
    },
    
    // Overline/Labels
    overline: {
      fontSize: '0.75rem',     // 12px - Micro
      lineHeight: '1rem',      // 16px
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#4B5563',
    },
  },
  
  // 🧩 Component Overrides - Modern styling for all MUI components
  components: {
    // 🔘 Button - Elevated, modern design
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1E3A5F 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#2563EB',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
            borderColor: '#1E3A5F',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem',
          borderRadius: 14,
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: 10,
        },
      },
    },
    
    // 📄 Paper - Soft shadows, rounded corners
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none', // Remove default gradient
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(17, 24, 39, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(17, 24, 39, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(17, 24, 39, 0.1)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(17, 24, 39, 0.12)',
        },
      },
    },
    
    // 🎴 Card - Modern card with hover effects
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(17, 24, 39, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(17, 24, 39, 0.12)',
          },
        },
      },
    },
    
    // 🔝 AppBar - Gradient or glass morphism
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(17, 24, 39, 0.08)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        colorPrimary: {
          background: 'linear-gradient(90deg, #1E3A5F 0%, #2563EB 100%)',
          color: '#FFFFFF',
        },
      },
    },
    
    // 📥 TextField - Clean, modern inputs with floating labels
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: '#E5E7EB',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#60A5FA',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#4B5563',
            '&.Mui-focused': {
              color: '#2563EB',
            },
          },
        },
      },
    },
    
    // 🔘 IconButton - Smooth interactions
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    
    // 📊 Chip - Modern badge style
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        filled: {
          backgroundColor: '#DBEAFE',
          color: '#1E3A5F',
        },
      },
    },
    
    // ℹ️ Alert - Enhanced alert design
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: '0.875rem',
          fontWeight: 500,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          color: '#059669',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#DC2626',
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          color: '#D97706',
        },
        standardInfo: {
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: 'rgba(37, 99, 235, 0.3)',
          color: '#1E3A5F',
        },
      },
    },
    
    // 📑 Tabs - Clean, modern tabs
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 56,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
            color: '#2563EB',
          },
          '&.Mui-selected': {
            color: '#2563EB',
          },
        },
      },
    },
    
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#2563EB',
        },
      },
    },
    
    // 🎯 Avatar - Polished avatars
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1.125rem',
          backgroundColor: '#2563EB',
        },
      },
    },
    
    // 📋 List Items
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 4,
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.16)',
            },
          },
        },
      },
    },
    
    // 🎛️ Switch
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#2563EB',
            '& + .MuiSwitch-track': {
              backgroundColor: '#2563EB',
            },
          },
        },
      },
    },
    
    // ☑️ Checkbox
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-checked': {
            color: '#2563EB',
          },
        },
      },
    },
  },
  
  // 🌈 Spacing System (8px grid as per blueprint)
  spacing: 8,
  
  // 🔄 Shape Configuration
  shape: {
    borderRadius: 12,
  },
  
  // ⚡ Breakpoints - Mobile-first responsive
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },
  
  // 🎬 Transitions - Smooth animations
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

export default theme;