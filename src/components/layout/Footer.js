'use client';

import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Grid,
  IconButton,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.dark',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo e Sobre */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MusicNoteIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                VENTO MUSICAL
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Projeto de extensão do IFPB que leva música para todos os cantos.
            </Typography>
          </Grid>

          {/* Links Rápidos */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Navegação
            </Typography>
            <Stack spacing={1}>
              <MuiLink 
                component={Link} 
                href="/" 
                color="inherit" 
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                • Início
              </MuiLink>
              <MuiLink 
                component={Link} 
                href="/sobre-nos" 
                color="inherit" 
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                • Sobre Nós
              </MuiLink>
              <MuiLink 
                component={Link} 
                href="/fotos" 
                color="inherit" 
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                • Galeria de Fotos
              </MuiLink>
              <MuiLink 
                component={Link} 
                href="/eventos" 
                color="inherit" 
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                • Eventos
              </MuiLink>
            </Stack>
          </Grid>

          {/* Contato */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Contato
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  ventomusical.ifpb@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  IFPB - Campus Esperança
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Redes Sociais e Créditos */}
        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
  <Typography variant="body2" sx={{ opacity: 0.8 }}>
    © {currentYear || '2024'} Projeto de Extensão - IFPB. Todos os direitos reservados.
  </Typography>

  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
    Site desenvolvido por{' '}
    <Link
      href="https://www.linkedin.com/in/henrique-bruno-4522073a0/"
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={{ color: 'inherit' }}
    >
      Henrique Bruno da Costa Oliveira
    </Link>
  </Typography>
</Box>


          <Box>
            <Typography variant="body2" sx={{ mb: 1, textAlign: { xs: 'center', sm: 'right' }, opacity: 0.8 }}>
              Siga-nos nas redes sociais:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
              <IconButton 
                color="inherit" 
                href="https://www.instagram.com/ventomusical/" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                href="mailto:ventomusical.ifpb@gmail.com"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}