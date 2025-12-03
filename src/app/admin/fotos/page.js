"use client";

import { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardMedia, CardContent,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [fotoParaExcluir, setFotoParaExcluir] = useState(null);

  useEffect(() => {
    fetch("/api/fotos/exibir")
      .then(res => res.json())
      .then(data => setFotos(data))
      .catch(err => console.error(err));

    fetch("/api/eventos/exibir")
      .then(res => res.json())
      .then(data => setEventos(data.evento || []))
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
        file: null
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

  const handleChange = field => event => {
    if (field === "file") {
      setNovaFoto({ ...novaFoto, file: event.target.files[0] });
    } else {
      setNovaFoto({ ...novaFoto, [field]: event.target.value });
    }
  };

  const handleSavePhoto = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("titulo", novaFoto.titulo);
      formData.append("descricao", novaFoto.descricao);
      formData.append("data_evento", novaFoto.data_evento);
      formData.append("evento_id", novaFoto.evento_id);

      if (editingPhoto) formData.append("id", editingPhoto.id);
      if (novaFoto.file) formData.append("file", novaFoto.file);

      const res = await fetch("/api/fotos/editar", {
        method: editingPhoto ? "PUT" : "POST",
        body: formData
      });

      const saved = await res.json();

      if (res.ok) {
        if (editingPhoto) {
          setFotos(fotos.map(f => (f.id === saved.id ? saved : f)));
          setSnackbarMessage("Foto atualizada com sucesso!");
        } else {
          setFotos([...fotos, saved]);
          setSnackbarMessage("Foto adicionada com sucesso!");
        }
      } else {
        setSnackbarMessage("Erro ao salvar foto.");
      }

      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Erro inesperado.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // 🚨 FUNÇÃO CORRIGIDA DE EXCLUSÃO COM CONFIRMAÇÃO
  const confirmarExclusao = async () => {
    if (!fotoParaExcluir) return;

    try {
      const res = await fetch("/api/fotos/editar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fotoParaExcluir.id })
      });

      if (res.ok) {
        setFotos(fotos.filter(f => f.id !== fotoParaExcluir.id));
        setSnackbarMessage("Foto excluída com sucesso!");
      } else {
        setSnackbarMessage("Erro ao excluir a foto.");
      }

      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
    }

    setOpenConfirmDelete(false);
    setFotoParaExcluir(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <div>
          <Typography variant="h4">Gerenciar Fotos</Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione, edite ou remova fotos da galeria
          </Typography>
        </div>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Adicionar Foto
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Fotos ({fotos.length})</Typography>

        <Grid container spacing={3}>
          {fotos.map(foto => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={foto.id}>
              <Card>
                <CardMedia component="img" height="140" image={foto.url_img} />
                <CardContent>
                  <Typography noWrap>{foto.titulo}</Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton onClick={() => handleOpenDialog(foto)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => {
                        setFotoParaExcluir(foto);
                        setOpenConfirmDelete(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingPhoto ? "Editar Foto" : "Adicionar Foto"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Título" value={novaFoto.titulo} onChange={handleChange("titulo")} sx={{ mt: 2 }} />
          <TextField fullWidth label="Descrição" value={novaFoto.descricao} onChange={handleChange("descricao")} sx={{ mt: 2 }} />
          <TextField fullWidth type="date" value={novaFoto.data_evento} onChange={handleChange("data_evento")} sx={{ mt: 2 }} />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Evento</InputLabel>
            <Select value={novaFoto.evento_id} onChange={handleChange("evento_id")} label="Evento">
              {eventos.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>{ev.titulo}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField fullWidth type="file" onChange={handleChange("file")} sx={{ mt: 2 }} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSavePhoto} disabled={loading}>
            {loading ? <CircularProgress size={22} /> : (editingPhoto ? "Atualizar" : "Salvar")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CONFIRMAR EXCLUSÃO */}
      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle>Excluir Foto</DialogTitle>

        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{fotoParaExcluir?.titulo}</strong>?<br />
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>

          <Button variant="contained" color="error" onClick={confirmarExclusao}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
}
