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
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowHeaderFooter(!pathname.startsWith('/admin'));
  }, [pathname]);

  return (
    <Providers>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Só renderiza no client (evita mismatch) */}
        {mounted && showHeaderFooter && <Header />}

        <main
          style={{
            minHeight: '70vh',
            backgroundColor: '#F5F9F5',
            paddingTop: showHeaderFooter ? '20px' : 0,
          }}
        >
          {children}
        </main>

        {mounted && showHeaderFooter && <Footer />}
      </ThemeProvider>
    </Providers>
  );
}
