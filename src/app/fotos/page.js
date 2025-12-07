'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/ZoomIn';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function GaleriaFotosPage() {
  const [fotos, setFotos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState('');
  const [fotoExpandida, setFotoExpandida] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [eventosAbertos, setEventosAbertos] = useState({});

  // Carregar fotos e eventos do backend
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carrega fotos e eventos em paralelo
      const [resFotos, resEventos] = await Promise.all([
        fetch('/api/fotos/exibir'),
        fetch('/api/evento/exibir')
      ]);
      
      if (!resFotos.ok) {
        const errorData = await resFotos.json();
        throw new Error(errorData.error || 'Erro ao carregar fotos');
      }
      
      if (!resEventos.ok) {
        const errorData = await resEventos.json();
        throw new Error(errorData.error || 'Erro ao carregar eventos');
      }
      
      const dadosFotos = await resFotos.json();
      const dadosEventos = await resEventos.json();
      
      console.log('Fotos carregadas:', dadosFotos);
      console.log('Eventos carregados:', dadosEventos);
      
      setFotos(dadosFotos);
      setEventos(dadosEventos);
      
      // Abre todos os eventos por padrão
      const eventosIniciais = {};
      dadosEventos.forEach(evento => {
        eventosIniciais[evento.id] = true;
      });
      setEventosAbertos(eventosIniciais);
      
    } catch (error) {
      console.error('Erro:', error);
      setErro(error.message || 'Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  // Filtrar fotos com base na busca
  const filtrarFotos = () => {
    if (!busca.trim()) return fotos;
    
    const termoBusca = busca.toLowerCase().trim();
    return fotos.filter(foto => 
      (foto.titulo && foto.titulo.toLowerCase().includes(termoBusca)) ||
      (foto.descricao && foto.descricao.toLowerCase().includes(termoBusca)) ||
      (foto.evento_titulo && foto.evento_titulo.toLowerCase().includes(termoBusca)) ||
      (foto.evento_local && foto.evento_local.toLowerCase().includes(termoBusca))
    );
  };

  const fotosFiltradas = filtrarFotos();

  // Agrupar fotos por evento
  const fotosPorEvento = {};
  
  // Primeiro, fotos sem evento
  fotosFiltradas.forEach(foto => {
    const eventoId = foto.evento_id;
    const eventoKey = eventoId ? eventoId.toString() : 'sem-evento';
    
    if (!fotosPorEvento[eventoKey]) {
      // Encontrar informações do evento
      const eventoInfo = eventos.find(e => e.id === eventoId);
      
      fotosPorEvento[eventoKey] = {
        evento: eventoId ? {
          id: eventoId,
          titulo: eventoInfo?.titulo || 'Evento Desconhecido',
          descricao: eventoInfo?.descricao,
          datahora: eventoInfo?.datahora_evento,
          local: eventoInfo?.local,
          link_drive: eventoInfo?.link_drive
        } : {
          id: 'sem-evento',
          titulo: 'Outras Fotos',
          descricao: 'Fotos sem evento específico'
        },
        fotos: []
      };
    }
    fotosPorEvento[eventoKey].fotos.push(foto);
  });

  // Ordenar eventos por data (mais recente primeiro)
  const eventosOrdenados = Object.entries(fotosPorEvento)
    .sort((a, b) => {
      const eventoA = a[1].evento;
      const eventoB = b[1].evento;
      
      if (eventoA.id === 'sem-evento') return 1;
      if (eventoB.id === 'sem-evento') return -1;
      
      const dataA = eventoA.datahora;
      const dataB = eventoB.datahora;
      
      if (!dataA) return 1;
      if (!dataB) return -1;
      
      return new Date(dataB) - new Date(dataA);
    });

  const handleSearch = (e) => {
    setBusca(e.target.value);
  };

  const toggleEvento = (eventoId) => {
    setEventosAbertos(prev => ({
      ...prev,
      [eventoId]: !prev[eventoId]
    }));
  };

  // FUNÇÕES DE FORMATAÇÃO CORRIGIDAS
  const formatarDataCurta = (datahoraString) => {
    if (!datahoraString) return '';
    
    try {
      // Se é string do PostgreSQL "2025-12-10 23:30:00"
      if (typeof datahoraString === 'string' && datahoraString.includes(' ')) {
        const [dataParte] = datahoraString.split(' ');
        const [ano, mes, dia] = dataParte.split('-');
        const data = new Date(ano, mes - 1, dia);
        return data.toLocaleDateString('pt-BR');
      }
      
      const data = new Date(datahoraString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return datahoraString;
    }
  };

  const formatarHora = (datahoraString) => {
    if (!datahoraString) return '';
    
    try {
      // Se é string do PostgreSQL "2025-12-10 23:30:00"
      if (typeof datahoraString === 'string' && datahoraString.includes(' ')) {
        const [, horaParte] = datahoraString.split(' ');
        const [hora, minuto] = horaParte.split(':');
        
        // ADICIONA 3 HORAS para compensar UTC → BRT
        const horasCorrigidas = (parseInt(hora) + 3) % 24;
        return `${String(horasCorrigidas).padStart(2, '0')}:${minuto}`;
      }
      
      const data = new Date(datahoraString);
      // ADICIONA 3 HORAS para compensar
      const horasCorrigidas = (data.getHours() + 3) % 24;
      const minutos = String(data.getMinutes()).padStart(2, '0');
      
      return `${String(horasCorrigidas).padStart(2, '0')}:${minutos}`;
    } catch {
      return datahoraString;
    }
  };

  const formatarDataHora = (datahoraString) => {
    if (!datahoraString) return '';
    
    try {
      // Se é string do PostgreSQL "2025-12-10 23:30:00"
      if (typeof datahoraString === 'string' && datahoraString.includes(' ')) {
        const [dataParte, horaParte] = datahoraString.split(' ');
        const [ano, mes, dia] = dataParte.split('-');
        const [hora, minuto] = horaParte.split(':');
        
        // Ajustar hora (+3h)
        const horasCorrigidas = (parseInt(hora) + 3) % 24;
        const data = new Date(ano, mes - 1, dia, horasCorrigidas, minuto);
        
        return data.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      const data = new Date(datahoraString);
      // Adiciona 3 horas para compensar
      const dataCorrigida = new Date(data.getTime() + (3 * 60 * 60 * 1000));
      
      return dataCorrigida.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return datahoraString;
    }
  };

  if (carregando) {
    return (
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={carregarDados}>
              Tentar novamente
            </Button>
          }
        >
          {erro}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PhotoAlbumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom color="primary">
          Galeria de Fotos
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          {fotos.length > 0 
            ? `Nossa coleção com ${fotos.length} fotos${eventosOrdenados.length > 1 ? ` em ${eventosOrdenados.length} eventos` : ''}`
            : 'Nenhuma foto disponível no momento'
          }
        </Typography>
      </Box>

      {/* Busca */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Buscar fotos por título, descrição, evento ou local..."
          value={busca}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {busca && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {fotosFiltradas.length} de {fotos.length} fotos
            {eventosOrdenados.length > 0 && ` em ${eventosOrdenados.length} eventos`}
          </Typography>
        )}
      </Paper>

      {/* Lista de Eventos com Fotos */}
      {eventosOrdenados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma foto encontrada.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={carregarDados}
            sx={{ mt: 2 }}
          >
            Recarregar
          </Button>
        </Paper>
      ) : (
        <Box>
          {eventosOrdenados.map(([eventoKey, dadosEvento]) => {
            const evento = dadosEvento.evento;
            const isOpen = eventosAbertos[evento.id] !== false;
            
            return (
              <Accordion 
                key={evento.id}
                expanded={isOpen}
                onChange={() => toggleEvento(evento.id)}
                sx={{ mb: 3 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {evento.titulo}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                        {evento.datahora && (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              {formatarDataCurta(evento.datahora)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              {formatarHora(evento.datahora)}
                            </Typography>
                          </>
                        )}
                        {evento.local && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {evento.local}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip 
                      label={`${dadosEvento.fotos.length} foto${dadosEvento.fotos.length !== 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  {evento.descricao && evento.id !== 'sem-evento' && (
                    <Typography paragraph sx={{ mb: 3 }}>
                      {evento.descricao}
                    </Typography>
                  )}
                  <Grid container spacing={3}>
                    {dadosEvento.fotos.map((foto) => (
                      <Grid item xs={12} sm={6} md={4} key={foto.id}>
                        <Card sx={{ 
                          position: 'relative',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                          }
                        }}>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="250"
                              image={foto.url}
                              alt={foto.titulo || 'Foto do evento'}
                              sx={{ 
                                cursor: 'pointer',
                                objectFit: 'cover',
                                width: '100%',
                              }}
                              onClick={() => setFotoExpandida({...foto, evento: evento})}
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => setFotoExpandida({...foto, evento: evento})}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                }
                              }}
                            >
                              <ExpandIcon />
                            </IconButton>
                          </Box>
                          <Box sx={{ p: 2, flexGrow: 1 }}>
                            {foto.titulo && (
                              <Typography variant="h6" gutterBottom>
                                {foto.titulo}
                              </Typography>
                            )}
                            
                            {foto.descricao && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {foto.descricao.length > 80 
                                  ? `${foto.descricao.substring(0, 80)}...` 
                                  : foto.descricao
                                }
                              </Typography>
                            )}
                            
                            {foto.data_evento && (
                              <Typography variant="caption" color="text.secondary">
                                {formatarDataCurta(foto.data_evento)}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {isOpen && evento.link_drive && (
                    <Box sx={{ mb: 3 }}>
                      <Paper
                        elevation={3}
                        sx={{
                          marginTop: 5,
                          p: 2.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderRadius: 3,
                          transition: "0.3s",
                          border: "1px solid",
                          borderColor: "primary.main",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: 6,
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                        component="a"
                        href={evento.link_drive}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PhotoAlbumIcon sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Ver pasta completa no Google Drive
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Clique para abrir no navegador
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Modal Foto Expandida */}
      <Dialog
        open={!!fotoExpandida}
        onClose={() => setFotoExpandida(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {fotoExpandida && (
            <>
              <IconButton
                aria-label="close"
                onClick={() => setFotoExpandida(null)}
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: 8,
                  zIndex: 1,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box sx={{ mb: 3 }}>
                <img
                  src={fotoExpandida.url}
                  alt={fotoExpandida.titulo || 'Foto do evento'}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '8px',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              
              <Box>
                {fotoExpandida.titulo && (
                  <Typography variant="h5" gutterBottom>
                    {fotoExpandida.titulo}
                  </Typography>
                )}
                
                {fotoExpandida.evento && fotoExpandida.evento.id !== 'sem-evento' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {fotoExpandida.evento.titulo}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                      {fotoExpandida.evento.datahora && (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {formatarDataCurta(fotoExpandida.evento.datahora)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {formatarHora(fotoExpandida.evento.datahora)}
                          </Typography>
                        </>
                      )}
                      {fotoExpandida.evento.local && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {fotoExpandida.evento.local}
                        </Typography>
                      )}
                    </Box>
                    {fotoExpandida.evento.descricao && (
                      <Typography variant="body2" paragraph>
                        {fotoExpandida.evento.descricao}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {fotoExpandida.evento.datahora && 
                        `Evento realizado em: ${formatarDataHora(fotoExpandida.evento.datahora)}`
                      }
                    </Typography>
                  </Box>
                )}
                
                {fotoExpandida.descricao && (
                  <Typography variant="body1" paragraph>
                    {fotoExpandida.descricao}
                  </Typography>
                )}
                
                {fotoExpandida.data_evento && (
                  <Typography variant="body2" color="text.secondary">
                    Data da foto: {formatarDataHora(fotoExpandida.data_evento)}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}