"use client";

import { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardContent,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function GerenciarEventos() {
  const [eventos, setEventos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    hora_evento: '',
    local: '',
    link_drive: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null);

  // Carregar dados
  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setLoadingData(true);
      
      const res = await fetch("/api/evento/exibir");
      
      if (!res.ok) {
        throw new Error('Erro ao carregar eventos');
      }
      
      const dados = await res.json();
      setEventos(dados);
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Erro ao carregar eventos');
      setOpenSnackbar(true);
    } finally {
      setLoadingData(false);
    }
  };

  // Contar fotos por evento
  const [contagemFotos, setContagemFotos] = useState({});

  useEffect(() => {
    const contarFotosPorEvento = async () => {
      try {
        const res = await fetch("/api/fotos/exibir");
        if (res.ok) {
          const fotos = await res.json();
          const contagem = {};
          
          fotos.forEach(foto => {
            if (foto.evento_id) {
              contagem[foto.evento_id] = (contagem[foto.evento_id] || 0) + 1;
            }
          });
          
          setContagemFotos(contagem);
        }
      } catch (err) {
        console.error('Erro ao contar fotos:', err);
      }
    };
    
    contarFotosPorEvento();
  }, [eventos]);

  const handleOpenDialog = (evento = null) => {
    if (evento) {
      setEditingEvento(evento);
      
      // Separar data e hora se existir uma datahora_evento
      let dataPart = '';
      let horaPart = '';
      
      if (evento.datahora_evento) {
        const datahora = new Date(evento.datahora_evento);
        dataPart = datahora.toISOString().split('T')[0];
        horaPart = datahora.toTimeString().slice(0, 5); // Formato HH:MM
      } else if (evento.data_evento) {
        dataPart = evento.data_evento.split('T')[0];
      }
      
      setNovoEvento({
        titulo: evento.titulo || '',
        descricao: evento.descricao || '',
        data_evento: dataPart || '',
        hora_evento: horaPart || '',
        local: evento.local || '',
        link_drive: evento.link_drive || ''
      });
    } else {
      setEditingEvento(null);
      setNovoEvento({ 
        titulo: '', 
        descricao: '', 
        data_evento: '', 
        hora_evento: '',
        local: '',
        link_drive: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvento(null);
    setNovoEvento({ 
      titulo: '', 
      descricao: '', 
      data_evento: '', 
      hora_evento: '',
      local: '', 
      link_drive: '' 
    });
  };

  const handleChange = field => event => {
    setNovoEvento({ ...novoEvento, [field]: event.target.value });
  };

  const handleSaveEvento = async () => {
    try {
      setLoading(true);

      // Validação básica
      if (!novoEvento.titulo.trim()) {
        setSnackbarMessage('O título do evento é obrigatório');
        setOpenSnackbar(true);
        return;
      }

      // Juntar data e hora em um único campo para o backend
      let datahoraEvento = null;
      
      if (novoEvento.data_evento) {
        if (novoEvento.hora_evento) {
          // Se tiver hora, combina data + hora
          const [year, month, day] = novoEvento.data_evento.split('-');
          const [hours, minutes] = novoEvento.hora_evento.split(':');
          
          // Cria a data/hora no fuso horário local
          const dataComHora = new Date(year, month - 1, day, hours, minutes);
          
          // Converte para string ISO (o backend provavelmente espera isso)
          datahoraEvento = `${novoEvento.data_evento}T${novoEvento.hora_evento}:00`;
        } else {
          // Se só tiver data, usar meia-noite
          const dataComHora = new Date(novoEvento.data_evento + 'T00:00:00');
          datahoraEvento = `${novoEvento.data_evento}T${novoEvento.hora_evento}:00`;
        }
      }

      const eventoData = {
        titulo: novoEvento.titulo.trim(),
        descricao: novoEvento.descricao.trim(),
        datahora_evento: datahoraEvento,
        local: novoEvento.local.trim() || null,
        link_drive: novoEvento.link_drive.trim() 
      };

      if (editingEvento) {
        eventoData.id = editingEvento.id;
      }

      const res = await fetch("/api/evento/editar", {
        method: editingEvento ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventoData)
      });

      const saved = await res.json();

      if (res.ok) {
        await carregarEventos(); // Recarrega os dados
        
        setSnackbarMessage(
          editingEvento 
            ? "Evento atualizado com sucesso!" 
            : "Evento criado com sucesso!"
        );
        setOpenSnackbar(true);
        handleCloseDialog();
      } else {
        setSnackbarMessage("Erro ao salvar evento: " + (saved.error || ''));
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Erro inesperado: " + err.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!eventoParaExcluir) return;

    // Verifica se o evento tem fotos associadas
    if (contagemFotos[eventoParaExcluir.id] > 0) {
      setSnackbarMessage(
        `Não é possível excluir o evento "${eventoParaExcluir.titulo}" porque existem ${contagemFotos[eventoParaExcluir.id]} fotos associadas a ele.`
      );
      setOpenSnackbar(true);
      setOpenConfirmDelete(false);
      setEventoParaExcluir(null);
      return;
    }

    try {
      const res = await fetch("/api/evento/editar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventoParaExcluir.id })
      });

      if (res.ok) {
        await carregarEventos(); // Recarrega os dados
        setSnackbarMessage("Evento excluído com sucesso!");
      } else {
        const errorData = await res.json();
        setSnackbarMessage("Erro ao excluir evento: " + (errorData.error || ''));
      }

      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Erro na conexão");
      setOpenSnackbar(true);
    }

    setOpenConfirmDelete(false);
    setEventoParaExcluir(null);
  };

  // Função para formatar data e hora completa
  const formatarDataHora = (datahoraString) => {
    if (!datahoraString) return 'Sem data/hora definida';
    
    try {
      const data = new Date(datahoraString);
      return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return datahoraString;
    }
  };

  // Função para formatar data curta
  const formatarDataCurta = (datahoraString) => {
    if (!datahoraString) return '';
    
    try {
      const data = new Date(datahoraString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return datahoraString;
    }
  };

  // Função para formatar hora
  const formatarHora = (datahoraString) => {
    if (!datahoraString) return '';
    
    try {
      const data = new Date(datahoraString);
      return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return datahoraString;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <div>
          <Typography variant="h4">Gerenciar Eventos</Typography>
          <Typography variant="body2" color="text.secondary">
            Crie, edite ou remova eventos da sua agenda
          </Typography>
        </div>

        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          disabled={loadingData}
        >
          Novo Evento
        </Button>
      </Box>

      {loadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Eventos ({eventos.length})
            </Typography>
            
            {eventos.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhum evento cadastrado
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {eventos.map(evento => {
              const quantidadeFotos = contagemFotos[evento.id] || 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={evento.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {evento.titulo}
                        </Typography>
                      </Box>
                      
                      {evento.descricao && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <DescriptionIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {evento.descricao.length > 100 
                              ? `${evento.descricao.substring(0, 100)}...` 
                              : evento.descricao}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mb: 2 }}>
                        {evento.datahora_evento && (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatarDataHora(evento.datahora_evento)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatarHora(evento.datahora_evento)}
                              </Typography>
                            </Box>
                          </>
                        )}
                        
                        {evento.local && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {evento.local}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          label={`${quantidadeFotos} foto${quantidadeFotos !== 1 ? 's' : ''}`}
                          size="small"
                          color={quantidadeFotos > 0 ? "primary" : "default"}
                          variant="outlined"
                        />
                        
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(evento)}
                            title="Editar evento"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setEventoParaExcluir(evento);
                              setOpenConfirmDelete(true);
                            }}
                            title="Excluir evento"
                            disabled={quantidadeFotos > 0}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {quantidadeFotos > 0 && (
                        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                          ⚠️ Este evento tem fotos associadas
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Diálogo para adicionar/editar evento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvento ? "Editar Evento" : "Criar Novo Evento"}
        </DialogTitle>
        
        <DialogContent>
          <TextField 
            fullWidth 
            label="Título do evento *" 
            value={novoEvento.titulo} 
            onChange={handleChange("titulo")} 
            sx={{ mt: 2 }}
            required
            helperText="Nome do evento que aparecerá na galeria"
            error={!novoEvento.titulo.trim()}
          />
          
          <TextField 
            fullWidth 
            label="Descrição" 
            value={novoEvento.descricao} 
            onChange={handleChange("descricao")} 
            sx={{ mt: 2 }}
            multiline
            rows={4}
            helperText="Descrição detalhada do evento (opcional)"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField 
              fullWidth 
              type="date" 
              label="Data do evento"
              value={novoEvento.data_evento} 
              onChange={handleChange("data_evento")} 
              InputLabelProps={{ shrink: true }}
              helperText="Data do evento"
            />

            <TextField 
              fullWidth 
              type="time" 
              label="Hora do evento"
              value={novoEvento.hora_evento} 
              onChange={handleChange("hora_evento")} 
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }} // Incrementos de 5 minutos
              helperText="Hora (opcional)"
            />
          </Box>

          <TextField 
            fullWidth 
            label="Local" 
            value={novoEvento.local} 
            onChange={handleChange("local")} 
            sx={{ mt: 2 }}
            helperText="Local onde o evento aconteceu/acontecerá (opcional)"
            placeholder="Ex: Teatro Municipal, Praça Central, etc."
          />

          <TextField
            fullWidth 
            label="Link da pasta do Google Drive"
            value={novoEvento.link_drive} 
            onChange={handleChange("link_drive")} 
            sx={{ mt: 2 }}
            helperText="Cole aqui o link da pasta onde estão as fotos"
            placeholder="Link da pasta do Google Drive"
          />
                  
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            * Campos obrigatórios
          </Typography>
          
          {novoEvento.data_evento && novoEvento.hora_evento && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Evento agendado para: {formatarDataHora(
                new Date(`${novoEvento.data_evento}T${novoEvento.hora_evento}`).toISOString()
              )}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSaveEvento} 
            disabled={loading || !novoEvento.titulo.trim()}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editingEvento ? (
              "Atualizar"
            ) : (
              "Criar Evento"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog 
        open={openConfirmDelete} 
        onClose={() => setOpenConfirmDelete(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        
        <DialogContent>
          {eventoParaExcluir && (
            <>
              <Typography gutterBottom>
                Tem certeza que deseja excluir o evento <strong>"{eventoParaExcluir.titulo}"</strong>?
              </Typography>
              
              {contagemFotos[eventoParaExcluir.id] > 0 ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Este evento tem {contagemFotos[eventoParaExcluir.id]} foto(s) associada(s). 
                  Se excluí-lo, as fotos permanecerão no sistema mas não estarão mais associadas a um evento específico.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Esta ação não pode ser desfeita.
                </Typography>
              )}
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Detalhes do evento:</strong>
                </Typography>
                {eventoParaExcluir.datahora_evento && (
                  <Typography variant="body2">
                    📅 {formatarDataHora(eventoParaExcluir.datahora_evento)}
                  </Typography>
                )}
                {eventoParaExcluir.local && (
                  <Typography variant="body2">
                    📍 {eventoParaExcluir.local}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDelete(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmarExclusao}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificação */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarMessage.includes('sucesso') ? 'success' : 
                   snackbarMessage.includes('não é possível') ? 'warning' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}