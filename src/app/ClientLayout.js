'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePathname } from 'next/navigation'; 
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from "./providers";
import { useEffect, useState } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#388E3C',
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#F5F9F5',
      paper: '#FFFFFF',
    },
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (pathname) {
      setShowHeaderFooter(!pathname.startsWith('/admin'));
    }
  }, [pathname]);

  // Durante a renderização do servidor, mostre tudo
  const isServer = !mounted;

  return (
    <Providers>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {(isServer || showHeaderFooter) && <Header />}
        
        <main style={{ 
          minHeight: '70vh', 
          backgroundColor: '#F5F9F5',
          paddingTop: (isServer || showHeaderFooter) ? '20px' : 0
        }}>
          {children}
        </main>
        
        {(isServer || showHeaderFooter) && <Footer />}
      </ThemeProvider>
    </Providers>
  );
}