'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header'; // Importação direta
import Footer from '@/components/layout/Footer'; // Importação direta
import { useEffect, useState } from 'react'; // Adicione useState

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

export default function ClientLayoutLayout({ children }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Verifica se está em uma rota de admin
  const isAdminRoute = pathname?.startsWith('/admin');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Providers>
        {/* Renderiza condicionalmente no cliente */}
        {isClient && !isAdminRoute && <Header />}
        
        {/* Mantenha a estrutura do main consistente */}
        <div style={{ 
          minHeight: '70vh', 
          backgroundColor: '#F5F9F5', 
          paddingTop: isAdminRoute ? '0' : '20px',
          position: 'relative'
        }}>
          {children}
        </div>
        
        {isClient && !isAdminRoute && <Footer />}
      </Providers>
    </ThemeProvider>
  );
}