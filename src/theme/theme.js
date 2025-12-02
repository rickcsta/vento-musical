'use client';

import { createTheme } from '@mui/material/styles';

// Tema VERDE forçado
export const greenTheme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // VERDE
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#388E3C', // VERDE
      light: '#66BB6A',
      dark: '#2E7D32',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#F8FBF8', // VERDE MUITO CLARO
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B5E20', // VERDE ESCURO
      secondary: '#4CAF50', // VERDE
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B5E20 !important',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%) !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#2E7D32 !important',
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%) !important',
          '&:hover': {
            backgroundColor: '#1B5E20 !important',
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%) !important',
          },
        },
        outlinedPrimary: {
          color: '#2E7D32 !important',
          borderColor: '#2E7D32 !important',
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.04) !important',
            borderColor: '#1B5E20 !important',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF !important',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF !important',
          border: '1px solid #E8F5E9 !important',
        },
      },
    },
  },
});

// Export default
export default greenTheme;