'use client';

import { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardMedia, CardContent,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

export default function GerenciarFotos() {
  const [fotos, setFotos] = useState([]);
  const [eventos, setEventos] = useState([]); // Para armazenar os eventos
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [novaFoto, setNovaFoto] = useState({ titulo: '', descricao: '', data_evento: '', evento_id: '', file: null });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar fotos e eventos do banco
  useEffect(() => {
    // Buscar fotos
    fetch("/api/fotos/exibir")
      .then(res => res.json())
      .then(data => setFotos(data))
      .catch(err => console.error(err));

    // Buscar eventos
    fetch("/api/eventos/exibir")
      .then(res => res.json())
      .then(data => {
        // Aqui você verifica se a resposta de eventos está correta
        setEventos(data.evento || []);  // Certifique-se que o array de eventos está sendo atribuído corretamente
      })
      .catch(err => console.error(err));
  }, []);

  const handleOpenDialog = (foto = null) => {
    if (foto) {
      setEditingPhoto(foto);
      setNovaFoto({
        titulo: foto.titulo,
        descricao: foto.descricao || '',
        data_evento: foto.data_evento?.split('T')[0] || '',
        evento_id: foto.evento_id || '',
        file: null, // Reset file when editing
      });
    } else {
      setEditingPhoto(null);
      setNovaFoto({ titulo: '', descricao: '', data_evento: '', evento_id: '', file: null });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhoto(null);
    setNovaFoto({ titulo: '', descricao: '', data_evento: '', evento_id: '', file: null });
  };

  const handleChange = (field) => (event) => {
    if (field === 'file') {
      setNovaFoto({ ...novaFoto, file: event.target.files[0] });
    } else {
      setNovaFoto({ ...novaFoto, [field]: event.target.value });
    }
  };

  const handleSavePhoto = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", novaFoto.file);
      formData.append("titulo", novaFoto.titulo);
      formData.append("descricao", novaFoto.descricao || "");
      formData.append("data_evento", novaFoto.data_evento);
      formData.append("evento_id", novaFoto.evento_id);

      let res;

      if (editingPhoto) {
        formData.append("id", editingPhoto.id);
        res = await fetch("/api/fotos", {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/fotos", {
          method: "POST",
          body: formData,
        });
      }

      const newPhoto = await res.json();

      if (res.ok) {
        if (editingPhoto) {
          setFotos(fotos.map(f => f.id === newPhoto.id ? newPhoto : f));
          setSnackbarMessage("Foto atualizada com sucesso!");
        } else {
          setFotos([...fotos, newPhoto]);
          setSnackbarMessage("Foto adicionada com sucesso!");
        }
      } else {
        setSnackbarMessage("Erro ao salvar foto.");
      }

      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao salvar foto.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await fetch("/api/fotos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setFotos(fotos.filter(f => f.id !== id));
      setSnackbarMessage("Foto removida com sucesso!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao remover foto.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>Gerenciar Fotos</Typography>
          <Typography variant="body2" color="text.secondary">Adicione, edite ou remova fotos da galeria pública</Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => window.open('/fotos', '_blank')}>Visualizar Galeria</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Adicionar Foto</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Fotos na Galeria ({fotos.length})</Typography>

        {fotos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Nenhuma foto cadastrada</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Adicionar Primeira Foto</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {fotos.map((foto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={foto.id}>
                <Card>
                  <CardMedia component="img" height="140" image={foto.url_img} alt={foto.titulo} />
                  <CardContent>
                    <Typography variant="subtitle1" noWrap>{foto.titulo}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">{foto.data_evento?.split('T')[0]}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(foto)} color="primary"><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => handleDeletePhoto(foto.id)} color="error"><DeleteIcon /></IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPhoto ? 'Editar Foto' : 'Adicionar Nova Foto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Título da Foto" value={novaFoto.titulo} onChange={handleChange('titulo')} margin="normal" required />
            <TextField fullWidth label="Descrição" value={novaFoto.descricao} onChange={handleChange('descricao')} margin="normal" />
            <TextField fullWidth label="Data do Evento" type="date" value={novaFoto.data_evento} onChange={handleChange('data_evento')} margin="normal" InputLabelProps={{ shrink: true }} />

            {/* Campo para escolher o evento */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Evento</InputLabel>
              <Select
                value={novaFoto.evento_id}
                onChange={handleChange('evento_id')}
                label="Evento"
                required
              >
                {eventos.map(evento => (
                  <MenuItem key={evento.id} value={evento.id}>{evento.titulo}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Upload de Arquivo */}
            <TextField
              fullWidth
              type="file"
              onChange={handleChange('file')}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSavePhoto} variant="contained" disabled={loading || !novaFoto.titulo || !novaFoto.file || !novaFoto.evento_id}>
            {loading ? <CircularProgress size={24} /> : (editingPhoto ? 'Atualizar' : 'Adicionar')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
}
