'use client';

import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Grid,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Contato */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1 }} />
              <Typography>ventomusical.ifpb@gmail.com</Typography>
            </Box>
          </Grid>

          {/* Links Rápidos */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Links Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <MuiLink component={Link} href="/sobre-nos" color="inherit" sx={{ mb: 1 }}>
                Sobre Nós
              </MuiLink>
              <MuiLink component={Link} href="/fotos" color="inherit" sx={{ mb: 1 }}>
                Galeria de Fotos
              </MuiLink>
              <MuiLink component={Link} href="/eventos" color="inherit" sx={{ mb: 1 }}>
                Próximos Eventos
              </MuiLink>
            </Box>
          </Grid>

          {/* Redes Sociais */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Redes Sociais
            </Typography>
            <Box>
              <IconButton color="inherit" href="https://www.instagram.com/ventomusical/" target="_blank">
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" align="center" sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          © {new Date().getFullYear()} Projeto Escolar - IFPB. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
}