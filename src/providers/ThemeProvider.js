'use client';

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema VERDE
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // VERDE
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#388E3C', // VERDE
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#F5F9F5', // Verde muito claro
      paper: '#FFFFFF',
    },
  },
});

export default function ThemeProvider({ children }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}