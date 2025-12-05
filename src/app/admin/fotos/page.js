"use client";

import { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardMedia, CardContent,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, MenuItem, Select, InputLabel, FormControl, CircularProgress,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function GerenciarFotos() {
  const [fotos, setFotos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [novaFoto, setNovaFoto] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    evento_id: '',
    file: null
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [fotoParaExcluir, setFotoParaExcluir] = useState(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoadingData(true);
      
      const [resFotos, resEventos] = await Promise.all([
        fetch("/api/fotos/exibir"),
        fetch("/api/evento/exibir")
      ]);
      
      if (!resFotos.ok) throw new Error('Erro ao carregar fotos');
      if (!resEventos.ok) throw new Error('Erro ao carregar eventos');
      
      const dadosFotos = await resFotos.json();
      const dadosEventos = await resEventos.json();
      
      setFotos(dadosFotos);
      setEventos(dadosEventos);
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Erro ao carregar dados');
      setOpenSnackbar(true);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenDialog = (foto = null) => {
    if (foto) {
      setEditingPhoto(foto);
      setNovaFoto({
        titulo: foto.titulo || '',
        descricao: foto.descricao || '',
        data_evento: foto.data_evento?.split('T')[0] || '',
        evento_id: foto.evento_id || '',
        file: null
      });
    } else {
      setEditingPhoto(null);
      setNovaFoto({ 
        titulo: '', 
        descricao: '', 
        data_evento: '', 
        evento_id: '', 
        file: null 
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhoto(null);
    setNovaFoto({ titulo: '', descricao: '', data_evento: '', evento_id: '', file: null });
  };

  const handleChange = field => event => {
  if (field === "file") {
    const file = event.target.files[0];
    if (file) {
      // Verificar tamanho ANTES de setar no state
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const tamanhoMB = (file.size / (1024*1024)).toFixed(2);
        setSnackbarMessage(`Arquivo muito grande: ${tamanhoMB}MB. Máximo permitido: 5 MB.`);
        setOpenSnackbar(true);
        event.target.value = ''; // Limpa o input
        return;
      }
      
      setNovaFoto({ ...novaFoto, file: file });
      
      // Mostra preview imediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        // Não precisamos guardar o data URL, apenas mostrar feedback
        console.log("Arquivo selecionado:", file.name, `${(file.size / (1024*1024)).toFixed(2)}MB`);
      };
      reader.readAsDataURL(file);
    }
  } else {
    setNovaFoto({ ...novaFoto, [field]: event.target.value });
  }
};

  const handleSavePhoto = async () => {
    try {
      setLoading(true);
      
      // Limpar mensagens anteriores
      setSnackbarMessage('');
      
      console.log("Iniciando salvamento...");
      console.log("Estado novaFoto:", novaFoto);
      console.log("Editing photo?", editingPhoto);

      // 🔥 1. Impedir mais de 2 fotos por evento
      if (novaFoto.evento_id) {
        const fotosDoEvento = fotos.filter(f => f.evento_id === novaFoto.evento_id);

        // Se estiver editando, ignora a própria foto
        const total = editingPhoto
          ? fotosDoEvento.filter(f => f.id !== editingPhoto.id).length
          : fotosDoEvento.length;

        if (total >= 2) {
          setSnackbarMessage("Este evento já possui 2 fotos. Exclua uma para adicionar outra.");
          setOpenSnackbar(true);
          setLoading(false);
          return;
        }
      }

      // 🔥 2. Upload da imagem (caso tenha)
      let url_img = editingPhoto?.url_img || editingPhoto?.url; // Tenta ambos os nomes

      console.log("Imagem atual (se edição):", url_img);
      console.log("Novo arquivo:", novaFoto.file);

      if (novaFoto.file) {
        console.log("Fazendo upload da imagem...");
        const formDataUpload = new FormData();
        formDataUpload.append("file", novaFoto.file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error('Erro no upload da imagem: ' + (errorData.error || 'Upload falhou'));
        }

        const uploadData = await uploadRes.json();
        url_img = uploadData.url;
        console.log("Upload bem sucedido. URL:", url_img);
      }

      // 🔥 3. Preparar dados para envio
      const fotoData = {
        titulo: novaFoto.titulo,
        descricao: novaFoto.descricao,
        data_evento: novaFoto.data_evento || null,
        evento_id: novaFoto.evento_id || null,
        url_img: url_img
      };

      console.log("Dados a serem enviados:", fotoData);

      if (editingPhoto) {
        fotoData.id = editingPhoto.id;
      }

      // 🔥 4. Salvar ou editar foto no banco
      const endpoint = "/api/fotos/editar";
      const method = editingPhoto ? "PUT" : "POST";
      
      console.log(`Enviando para: ${endpoint} com método: ${method}`);
      
      const res = await fetch(endpoint, {
        method: method,
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(fotoData)
      });

      const saved = await res.json();
      console.log("Resposta do servidor:", saved);

      if (res.ok) {
        console.log("Sucesso! Recarregando dados...");
        await carregarDados();

        setSnackbarMessage(
          editingPhoto 
            ? "Foto atualizada com sucesso!" 
            : "Foto adicionada com sucesso!"
        );
        setOpenSnackbar(true);
        handleCloseDialog();
      } else {
        const errorMsg = saved.error || 'Erro desconhecido';
        console.error("Erro na resposta:", errorMsg);
        setSnackbarMessage("Erro ao salvar foto: " + errorMsg);
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error("Erro completo:", err);
      setSnackbarMessage("Erro inesperado: " + err.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!fotoParaExcluir) return;

    try {
      const res = await fetch("/api/fotos/editar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fotoParaExcluir.id })
      });

      if (res.ok) {
        await carregarDados(); // Recarrega os dados
        setSnackbarMessage("Foto excluída com sucesso!");
      } else {
        const errorData = await res.json();
        setSnackbarMessage("Erro ao excluir a foto: " + (errorData.error || ''));
      }

      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Erro na conexão");
      setOpenSnackbar(true);
    }

    setOpenConfirmDelete(false);
    setFotoParaExcluir(null);
  };

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'Sem data';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  };

  // Encontrar informações do evento
  const getEventoInfo = (eventoId) => {
    return eventos.find(e => e.id === eventoId);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <div>
          <Typography variant="h4">Gerenciar Fotos</Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione, edite ou remova fotos da galeria
          </Typography>
        </div>

        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          disabled={loadingData}
        >
          Adicionar Foto
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
              Fotos ({fotos.length})
            </Typography>
            
            {fotos.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhuma foto cadastrada
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {fotos.map(foto => {
              const eventoInfo = getEventoInfo(foto.evento_id);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={foto.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia 
                      component="img" 
                      height="160" 
                      image={foto.url || foto.url_img} // Suporte para ambos os nomes
                      alt={foto.titulo}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" noWrap gutterBottom>
                        {foto.titulo || 'Sem título'}
                      </Typography>
                      
                      {foto.descricao && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {foto.descricao.length > 60 
                            ? `${foto.descricao.substring(0, 60)}...` 
                            : foto.descricao}
                        </Typography>
                      )}
                      
                      <Box sx={{ mb: 2 }}>
                        {eventoInfo && (
                          <Chip 
                            icon={<EventIcon />}
                            label={eventoInfo.titulo}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        )}
                        
                        {foto.data_evento && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatarData(foto.data_evento)}
                            </Typography>
                          </Box>
                        )}
                        
                        {eventoInfo?.local && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {eventoInfo.local}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(foto)}
                          title="Editar foto"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setFotoParaExcluir(foto);
                            setOpenConfirmDelete(true);
                          }}
                          title="Excluir foto"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Diálogo para adicionar/editar foto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPhoto ? "Editar Foto" : "Adicionar Nova Foto"}
        </DialogTitle>
        
        <DialogContent>
          <TextField 
            fullWidth 
            label="Título da foto" 
            value={novaFoto.titulo} 
            onChange={handleChange("titulo")} 
            sx={{ mt: 2 }}
            required
            helperText="Título que aparecerá na galeria"
          />
          
          <TextField 
            fullWidth 
            label="Descrição" 
            value={novaFoto.descricao} 
            onChange={handleChange("descricao")} 
            sx={{ mt: 2 }}
            multiline
            rows={3}
            helperText="Descrição opcional da foto"
          />
          
          <TextField 
            fullWidth 
            type="date" 
            label="Data da foto"
            value={novaFoto.data_evento} 
            onChange={handleChange("data_evento")} 
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            helperText="Data em que a foto foi tirada"
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Evento associado</InputLabel>
            <Select 
              value={novaFoto.evento_id} 
              onChange={handleChange("evento_id")} 
              label="Evento associado"
            >
              <MenuItem value="">
                <em>Nenhum evento</em>
              </MenuItem>
              {eventos.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>
                  {ev.titulo} {ev.data_evento ? `(${formatarData(ev.data_evento)})` : ''}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Opcional. Associe esta foto a um evento específico.
            </Typography>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              {editingPhoto ? "Substituir imagem (opcional)" : "Selecionar imagem *"}
            </Typography>
            
            <Button 
              variant="outlined" 
              component="label"
              fullWidth
            >
              {editingPhoto ? "Escolher nova imagem" : "Escolher imagem"}
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={handleChange("file")} 
              />
            </Button>
            
            {novaFoto.file && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                Arquivo selecionado: {novaFoto.file.name}
              </Typography>
            )}
            
            {editingPhoto && !novaFoto.file && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                A imagem atual será mantida
              </Typography>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSavePhoto} 
            disabled={loading || (!editingPhoto && !novaFoto.file)}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editingPhoto ? (
              "Atualizar"
            ) : (
              "Salvar Foto"
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
          <Typography gutterBottom>
            Tem certeza que deseja excluir a foto <strong>"{fotoParaExcluir?.titulo || 'Sem título'}"</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Esta ação não pode ser desfeita. A imagem também será removida do armazenamento.
          </Typography>
          
          {fotoParaExcluir?.url && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={fotoParaExcluir.url} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '150px',
                  borderRadius: '4px'
                }} 
              />
            </Box>
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
          severity={snackbarMessage.includes('sucesso') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}