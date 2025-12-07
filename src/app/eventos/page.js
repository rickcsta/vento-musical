'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HistoryIcon from '@mui/icons-material/History';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [eventosFuturos, setEventosFuturos] = useState([]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState(0); // 0 = todos, 1 = futuros, 2 = passados
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [eventoExpandido, setEventoExpandido] = useState(null);
  const [filtroLocal, setFiltroLocal] = useState('');

  // Carregar eventos do backend
  useEffect(() => {
    carregarEventos();
  }, []);

  // Separar eventos por data
  useEffect(() => {
    if (eventos.length > 0) {
      const hoje = new Date();
      
      const futuros = eventos.filter(evento => {
        if (!evento.datahora_evento) return false;
        const dataEvento = new Date(evento.datahora_evento);
        return dataEvento >= hoje;
      }).sort((a, b) => new Date(a.datahora_evento) - new Date(b.datahora_evento));
      
      const passados = eventos.filter(evento => {
        if (!evento.datahora_evento) return false;
        const dataEvento = new Date(evento.datahora_evento);
        return dataEvento < hoje;
      }).sort((a, b) => new Date(b.datahora_evento) - new Date(a.datahora_evento));
      
      setEventosFuturos(futuros);
      setEventosPassados(passados);
      setEventosFiltrados(eventos);
    }
  }, [eventos]);

  // Filtrar eventos com base na busca e aba ativa
  useEffect(() => {
    filtrarEventos();
  }, [eventos, busca, abaAtiva, filtroLocal]);

  const carregarEventos = async () => {
    try {
      setCarregando(true);
      
      const res = await fetch("/api/evento/exibir");
      
      if (!res.ok) {
        throw new Error('Erro ao carregar eventos');
      }
      
      const dados = await res.json();
      setEventos(dados);
    } catch (error) {
      console.error('Erro:', error);
      setErro('Não foi possível carregar os eventos. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  const filtrarEventos = () => {
    let listaBase = [];
    
    // Seleciona a lista base baseado na aba ativa
    switch (abaAtiva) {
      case 0: // Todos
        listaBase = [...eventos];
        break;
      case 1: // Futuros
        listaBase = [...eventosFuturos];
        break;
      case 2: // Passados
        listaBase = [...eventosPassados];
        break;
    }
    
    let filtrados = listaBase;
    
    // Filtro por busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase().trim();
      filtrados = filtrados.filter(evento => 
        (evento.titulo && evento.titulo.toLowerCase().includes(termoBusca)) ||
        (evento.descricao && evento.descricao.toLowerCase().includes(termoBusca))
      );
    }
    
    // Filtro por local
    if (filtroLocal.trim()) {
      const termoLocal = filtroLocal.toLowerCase().trim();
      filtrados = filtrados.filter(evento => 
        evento.local && evento.local.toLowerCase().includes(termoLocal)
      );
    }
    
    setEventosFiltrados(filtrados);
  };

  const handleSearch = (e) => {
    setBusca(e.target.value);
  };

  const handleFiltroLocal = (e) => {
    setFiltroLocal(e.target.value);
  };

  const handleChangeAba = (event, newValue) => {
    setAbaAtiva(newValue);
  };

  // Formatar data curta
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

  // Formatar hora (+3 horas para compensar UTC → BRT)
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

  // Formatar data e hora completa (+3 horas)
  const formatarDataHora = (datahoraString) => {
    if (!datahoraString) return 'Data e hora a confirmar';
    
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

  // Verificar se é evento futuro
  const isEventoFuturo = (datahoraEvento) => {
    if (!datahoraEvento) return false;
    const hoje = new Date();
    const data = new Date(datahoraEvento);
    return data >= hoje;
  };

  // Calcular dias até o evento
  const calcularDiasAteEvento = (datahoraEvento) => {
    if (!datahoraEvento) return null;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(datahoraEvento);
    data.setHours(0, 0, 0, 0);
    
    const diffTime = data - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
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
            <Button color="inherit" size="small" onClick={carregarEventos}>
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
        <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom color="primary">
          Nossa Agenda de Eventos
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Confira nossa programação de eventos musicais
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {eventos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eventos no Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {eventosFuturos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Próximos Eventos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {eventosPassados.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eventos Realizados
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Tabs 
          value={abaAtiva} 
          onChange={handleChangeAba}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<EventIcon />} 
            label="Todos os Eventos" 
            iconPosition="start"
          />
          <Tab 
            icon={<UpcomingIcon />} 
            label={`Futuros (${eventosFuturos.length})`}
            iconPosition="start"
            disabled={eventosFuturos.length === 0}
          />
          <Tab 
            icon={<HistoryIcon />} 
            label={`Passados (${eventosPassados.length})`}
            iconPosition="start"
            disabled={eventosPassados.length === 0}
          />
        </Tabs>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar eventos por título ou descrição..."
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
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Filtrar por local..."
              value={filtroLocal}
              onChange={handleFiltroLocal}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterAltIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {(busca || filtroLocal) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
            {abaAtiva === 1 ? ' futuros' : abaAtiva === 2 ? ' passados' : ''}
          </Typography>
        )}
      </Paper>

      {/* Lista de Eventos */}
      {eventosFiltrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {abaAtiva === 1 ? 'Nenhum evento futuro encontrado' : 
             abaAtiva === 2 ? 'Nenhum evento passado encontrado' : 
             'Nenhum evento encontrado'}
          </Typography>
          {(busca || filtroLocal) && (
            <Button 
              variant="outlined" 
              onClick={() => {
                setBusca('');
                setFiltroLocal('');
              }}
              sx={{ mt: 2 }}
            >
              Limpar filtros
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {eventosFiltrados.map((evento) => {
            const isFuturo = isEventoFuturo(evento.datahora_evento);
            const diasAteEvento = calcularDiasAteEvento(evento.datahora_evento);
            
            return (
              <Grid item xs={12} key={evento.id}>
                <Card sx={{ 
                  borderLeft: isFuturo ? '4px solid #4caf50' : '4px solid #9e9e9e'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {isFuturo ? (
                            <UpcomingIcon sx={{ mr: 1, color: 'success.main' }} />
                          ) : (
                            <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          )}
                          
                          <Typography variant="h5">
                            {evento.titulo}
                          </Typography>
                          
                          {isFuturo && diasAteEvento !== null && diasAteEvento >= 0 && (
                            <Chip 
                              label={`Em ${diasAteEvento} dia${diasAteEvento !== 1 ? 's' : ''}`}
                              color="success"
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {evento.datahora_evento && (
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body1">
                                  <strong>Data:</strong> {formatarDataCurta(evento.datahora_evento)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          
                          {evento.datahora_evento && (
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body1">
                                  <strong>Hora:</strong> {formatarHora(evento.datahora_evento)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          
                          {evento.local && (
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body1">
                                  <strong>Local:</strong> {evento.local}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                        
                        {evento.descricao && (
                          <Box sx={{ mt: 2 }}>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2" color="primary">
                                  Ver descrição do evento
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                  {evento.descricao}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          </Box>
                        )}
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        onClick={() => setEventoExpandido(evento)}
                        sx={{ ml: 2 }}
                      >
                        Detalhes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Detalhes do Evento */}
      <Dialog
        open={!!eventoExpandido}
        onClose={() => setEventoExpandido(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {eventoExpandido && (
            <>
              <IconButton
                aria-label="close"
                onClick={() => setEventoExpandido(null)}
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EventIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                  <Typography variant="h4">
                    {eventoExpandido.titulo}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  {eventoExpandido.datahora_evento && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Data
                          </Typography>
                          <Typography variant="body1">
                            {formatarDataCurta(eventoExpandido.datahora_evento)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Hora
                          </Typography>
                          <Typography variant="body1">
                            {formatarHora(eventoExpandido.datahora_evento)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Data e Hora Completa
                          </Typography>
                          <Typography variant="body1">
                            {formatarDataHora(eventoExpandido.datahora_evento)}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                  
                  {eventoExpandido.local && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Local
                        </Typography>
                        <Typography variant="body1">
                          {eventoExpandido.local}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {isEventoFuturo(eventoExpandido.datahora_evento) && (
                    <Box sx={{ 
                      backgroundColor: 'success.light', 
                      color: 'success.dark',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography variant="body2">
                        🎵 <strong>Evento Futuro</strong> - Em breve!
                      </Typography>
                    </Box>
                  )}
                  
                  {eventoExpandido.link_drive && (
                    <Box sx={{ 
                      backgroundColor: 'info.light', 
                      color: 'info.dark',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography variant="body2">
                        📁 <strong>Fotos disponíveis:</strong>{' '}
                        <a 
                          href={eventoExpandido.link_drive} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                          Acessar fotos no Google Drive
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {eventoExpandido.descricao && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          Sobre o Evento
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {eventoExpandido.descricao}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Seção de Chamada para Ação */}
      {(abaAtiva === 0 || abaAtiva === 1) && eventosFuturos.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 6, 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4caf50 0%, #4caf50 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Não perca nossos próximos eventos!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Fique atento à nossa programação e garanta sua presença.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: 'white',
                color: '#4caf50',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
              onClick={() => {
                setAbaAtiva(1);
                setBusca('');
                setFiltroLocal('');
              }}
            >
              Ver Próximos Eventos
            </Button>
            
            <Button 
              variant="outlined" 
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Voltar ao Topo
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}