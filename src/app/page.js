'use client';

import { Container, Typography, Button, Grid, Card, CardContent, CardMedia, Box, Paper } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EventIcon from '@mui/icons-material/Event';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        borderRadius: 3,
        color: 'white',
        mb: 6,
        position: 'relative',
        overflow: 'hidden',
        marginTop: 10,
      }}>
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            opacity: 0.1,
          }}
        >
        </Box>
        
        <Typography variant="h2" gutterBottom fontWeight="bold">
          Bem-vindo ao Vento Musical
        </Typography>
        <Typography variant="h5" paragraph sx={{ maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
          Levando música e emoção para eventos e apresentações culturais.
        </Typography>
        <Button 
          component={Link} 
          href="/sobre-nos" 
          variant="contained" 
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            mt: 3, 
            backgroundColor: 'white', 
            color: '#1B5E20', 
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#F5F9F5',
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          }}
        >
          Conheça Mais
        </Button>
      </Box>

      {/* Cards de Seções */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)',
            }
          }}>
            <CardMedia
              component="img"
              height="200"
              image="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop"
              alt="Sobre Nós"
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" color="primary.main">
                  Sobre Nós
                </Typography>
              </Box>
              <Typography paragraph color="text.secondary">
                Conheça nossa história, missão e equipe que faz tudo acontecer.
              </Typography>
              <Button 
                component={Link} 
                href="/sobre-nos" 
                variant="outlined" 
                color="primary"
                fullWidth
              >
                Saiba Mais
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)',
            }
          }}>
            <CardMedia
              component="img"
              height="200"
              image="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop"
              alt="Fotos"
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhotoCameraIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" color="primary.main">
                  Galeria de Fotos
                </Typography>
              </Box>
              <Typography paragraph color="text.secondary">
                Veja os melhores momentos capturados em nossos eventos.
              </Typography>
              <Button 
                component={Link} 
                href="/fotos" 
                variant="outlined" 
                color="primary"
                fullWidth
              >
                Ver Fotos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)',
            }
          }}>
            <CardMedia
              component="img"
              height="200"
              image="https://images.unsplash.com/photo-1501281667305-0d4e0ab0c5fa?q=80&w=1000&auto=format&fit=crop"
              alt="Eventos"
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" color="primary.main">
                  Próximos Eventos
                </Typography>
              </Box>
              <Typography paragraph color="text.secondary">
                Confira nossa agenda e programe-se para os próximos eventos.
              </Typography>
              <Button 
                component={Link} 
                href="/eventos" 
                variant="outlined" 
                color="primary"
                fullWidth
              >
                Ver Agenda
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}