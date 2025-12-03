'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePathname } from 'next/navigation'; 
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from "./providers";

const inter = Inter({ subsets: ['latin'] });


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

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="pt-BR">
      <head>
        <title>Vento Musical</title>
        <meta name="description" content="Levando musica para todo lugar" />
      </head>
      <body className={inter.className}>
        <Providers>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {!isAdminRoute && <Header />}
          
          <main style={{ 
            minHeight: '70vh', 
            backgroundColor: '#F5F9F5',
            paddingTop: isAdminRoute ? 0 : '20px' 
          }}>
            {children}
          </main>
          
          {!isAdminRoute && <Footer />}
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}