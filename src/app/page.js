'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageIcon from '@mui/icons-material/Image';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { keyframes } from '@emotion/react';

// Animação sutil para elementos
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(27, 94, 32, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(27, 94, 32, 0); }
  100% { box-shadow: 0 0 0 0 rgba(27, 94, 32, 0); }
`;

export default function HomePage() {
  const [dados, setDados] = useState({
    fotos: [],
    eventos: [],
    carregando: true,
    erro: null
  });
  const [fotoAtual, setFotoAtual] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setDados(prev => ({ ...prev, carregando: true, erro: null }));
      
      const [fotosRes, eventosRes] = await Promise.all([
        fetch('/api/fotos/exibir'),
        fetch('/api/evento/exibir')
      ]);

      if (!fotosRes.ok || !eventosRes.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const fotos = await fotosRes.json();
      const eventos = await eventosRes.json();

      const hoje = new Date();
      const eventosOrdenados = eventos
        .filter(evento => evento.data_evento)
        .sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));

      setDados({
        fotos,
        eventos: eventosOrdenados,
        carregando: false,
        erro: null
      });
    } catch (error) {
      console.error('Erro:', error);
      setDados(prev => ({
        ...prev,
        carregando: false,
        erro: 'Não foi possível carregar os dados'
      }));
    }
  };

  const proximasFotos = dados.fotos.slice(0, 5);
  const proximosEventos = dados.eventos
    .filter(evento => {
      if (!evento.data_evento) return false;
      const dataEvento = new Date(evento.data_evento);
      return dataEvento >= new Date();
    })
    .slice(0, 3);

  const proximaFoto = () => {
    setFotoAtual((prev) => (prev + 1) % proximasFotos.length);
  };

  const fotoAnterior = () => {
    setFotoAtual((prev) => (prev - 1 + proximasFotos.length) % proximasFotos.length);
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dataString;
    }
  };

  if (dados.carregando) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f8fdf8 0%, #ffffff 100%)'
      }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={80} 
            thickness={2}
            sx={{ 
              color: '#1B5E20',
              animation: `${pulseAnimation} 2s infinite`
            }} 
          />
          <MusicNoteIcon 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 30,
              color: '#1B5E20'
            }} 
          />
        </Box>
        <Typography variant="h6" sx={{ mt: 3, color: '#2E7D32', fontWeight: 500 }}>
          Carregando conteúdo musical...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Hero Section com efeito gradiente */}
      <Box sx={{ 
        textAlign: 'center', 
        py: { xs: 6, md: 10 },
        mb: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #0d3b1e 0%, #1B5E20 30%, #2E7D32 100%)',
        boxShadow: '0 20px 40px rgba(27, 94, 32, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }
      }}>
        {/* Elementos decorativos musicais */}
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 40, 
          animation: `${floatAnimation} 6s ease-in-out infinite`,
          opacity: 0.2
        }}>
          <MusicNoteIcon sx={{ fontSize: 80, transform: 'rotate(45deg)' }} />
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          bottom: 30, 
          left: 50, 
          animation: `${floatAnimation} 7s ease-in-out infinite 1s`,
          opacity: 0.15
        }}>
          <MusicNoteIcon sx={{ fontSize: 60, transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip 
            label="Música & Cultura" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)'
            }} 
          />
          
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.2rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #e8f5e9 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Vento Musical
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              maxWidth: '700px', 
              margin: '0 auto', 
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1rem', md: '1.3rem' },
              px: 2,
              mb: 4,
              fontWeight: 300,
              lineHeight: 1.6
            }}
          >
            Harmonia que transforma momentos em memórias inesquecíveis
          </Typography>
          
          <Button 
            component={Link} 
            href="/sobre-nos" 
            variant="contained" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              backgroundColor: 'white', 
              color: '#1B5E20', 
              fontWeight: 700,
              borderRadius: 50,
              boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#f0f9f0',
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 12px 30px rgba(255,255,255,0.4)',
              }
            }}
          >
            Descubra Nossa História
          </Button>
        </Box>
      </Box>

      {/* Cards de Funcionalidades */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Card Sobre Nós */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fdf8 100%)',
              border: '1px solid rgba(27, 94, 32, 0.1)',
              boxShadow: '0 8px 32px rgba(27, 94, 32, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 20px 40px rgba(27, 94, 32, 0.15)',
                borderColor: 'rgba(27, 94, 32, 0.2)',
              }
            }}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(27, 94, 32, 0.3)',
                    mx: 'auto',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      border: '2px dashed rgba(27, 94, 32, 0.2)',
                      animation: `${pulseAnimation} 3s infinite`,
                    }
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 36 }} />
                </Box>

                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#1B5E20',
                  mb: 2,
                  textAlign: 'center'
                }}>
                  Nossa Jornada
                </Typography>

                <Typography variant="body1" sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Conheça a história por trás do Vento Musical, nossa paixão pela música e compromisso com a excelência artística.
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/sobre-nos"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                  boxShadow: '0 4px 15px rgba(27, 94, 32, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(27, 94, 32, 0.3)',
                  }
                }}
              >
                Explorar Equipe
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Galeria */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fdf8 100%)',
              border: '1px solid rgba(27, 94, 32, 0.1)',
              boxShadow: '0 8px 32px rgba(27, 94, 32, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 20px 40px rgba(27, 94, 32, 0.15)',
                borderColor: 'rgba(27, 94, 32, 0.2)',
              }
            }}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                    mx: 'auto',
                  }}
                >
                  <ImageIcon sx={{ fontSize: 36 }} />
                </Box>

                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#2E7D32',
                  mb: 2,
                  textAlign: 'center'
                }}>
                  Galeria Visual
                </Typography>

                {/* Carrossel melhorado */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Box
                    sx={{
                      height: 200,
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      background: '#f5f5f5'
                    }}
                  >
                    {proximasFotos.length > 0 ? (
                      <>
                        {proximasFotos.map((foto, index) => (
                          <Box
                            key={foto.id}
                            sx={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              opacity: index === fotoAtual ? 1 : 0,
                              transition: 'opacity 0.8s ease-in-out',
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={foto.url}
                              alt={foto.titulo || 'Foto da galeria'}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          </Box>
                        ))}
                        
                        {/* Indicadores */}
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 10, 
                          left: 0, 
                          right: 0, 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: 1 
                        }}>
                          {proximasFotos.map((_, index) => (
                            <Box
                              key={index}
                              onClick={() => setFotoAtual(index)}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: index === fotoAtual ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: 'white',
                                  transform: 'scale(1.2)'
                                }
                              }}
                            />
                          ))}
                        </Box>

                        {/* Setas */}
                        {proximasFotos.length > 1 && (
                          <>
                            <IconButton
                              onClick={fotoAnterior}
                              sx={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                backdropFilter: 'blur(4px)',
                                '&:hover': { 
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  transform: 'translateY(-50%) scale(1.1)'
                                }
                              }}
                            >
                              <NavigateBeforeIcon />
                            </IconButton>

                            <IconButton
                              onClick={proximaFoto}
                              sx={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                backdropFilter: 'blur(4px)',
                                '&:hover': { 
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  transform: 'translateY(-50%) scale(1.1)'
                                }
                              }}
                            >
                              <NavigateNextIcon />
                            </IconButton>
                          </>
                        )}
                      </>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: 'text.secondary'
                      }}>
                        <Typography>Nenhuma foto disponível</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              <Button
                component={Link}
                href="/fotos"
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#2E7D32',
                  borderColor: '#2E7D32',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(46, 125, 50, 0.04)',
                    borderColor: '#1B5E20',
                  }
                }}
                disabled={dados.fotos.length === 0}
              >
                Explorar Galeria ({dados.fotos.length})
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Eventos */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fdf8 100%)',
              border: '1px solid rgba(27, 94, 32, 0.1)',
              boxShadow: '0 8px 32px rgba(27, 94, 32, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 20px 40px rgba(27, 94, 32, 0.15)',
                borderColor: 'rgba(27, 94, 32, 0.2)',
              }
            }}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #388E3C 0%, #81C784 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(56, 142, 60, 0.3)',
                    mx: 'auto',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 36 }} />
                </Box>

                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#388E3C',
                  mb: 2,
                  textAlign: 'center'
                }}>
                  Agenda Musical
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {proximosEventos.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5f9f5 0%, #f0f7f0 100%)'
                    }}>
                      <EventIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Aguarde nossos próximos eventos
                      </Typography>
                    </Box>
                  ) : (
                    proximosEventos.map(evento => (
                      <Box
                        key={evento.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          backgroundColor: '#f9fdf9',
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: '#4CAF50',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1B5E20' }}>
                          {evento.titulo}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#4CAF50' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatarData(evento.data_evento)}
                          </Typography>
                        </Box>
                        {evento.local && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: '#4CAF50' }} />
                            <Typography variant="caption" color="text.secondary">
                              {evento.local}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              <Button
                component={Link}
                href="/eventos"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)',
                  boxShadow: '0 4px 15px rgba(56, 142, 60, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(56, 142, 60, 0.3)',
                  }
                }}
              >
                Ver Todos os Eventos
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rodapé decorativo */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 4,
        borderTop: '1px solid rgba(27, 94, 32, 0.1)',
        mt: 4
      }}>
        <MusicNoteIcon sx={{ 
          fontSize: 40, 
          color: '#1B5E20', 
          opacity: 0.7,
          animation: `${floatAnimation} 3s ease-in-out infinite`
        }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          A música é o vento que nos leva a lugares inesquecíveis
        </Typography>
      </Box>
    </Container>
  );
}