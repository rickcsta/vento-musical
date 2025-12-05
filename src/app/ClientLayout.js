'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Providers } from './providers';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' },
    secondary: { main: '#388E3C', light: '#66BB6A', dark: '#2E7D32' },
    background: { default: '#F5F9F5', paper: '#FFFFFF' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B5E20',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        },
      },
    },
  },
});

export default function ClientLayout({ children }) {
  return (
    <Providers>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Header e Footer sempre client-only */}
        <Header />
        <main
          style={{
            minHeight: '70vh',
            backgroundColor: '#F5F9F5',
            paddingTop: '20px',
          }}
        >
          {children}
        </main>
        <Footer />
      </ThemeProvider>
    </Providers>
  );
}
