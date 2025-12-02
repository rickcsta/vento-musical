'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// Dados iniciais
const initialPhotos = [
  { id: 1, url: 'https://source.unsplash.com/random?event1', titulo: 'Evento Corporativo 2024', categoria: 'Corporativo', data: '15/03/2024' },
  { id: 2, url: 'https://source.unsplash.com/random?event2', titulo: 'Casamento Verão', categoria: 'Casamento', data: '10/02/2024' },
  { id: 3, url: 'https://source.unsplash.com/random?event3', titulo: 'Aniversário Infantil', categoria: 'Festa', data: '05/02/2024' },
];

const categorias = ['Corporativo', 'Casamento', 'Festa', 'Workshop', 'Formatura', 'Beneficente'];

export default function GerenciarFotos() {
  const [fotos, setFotos] = useState(initialPhotos);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [novaFoto, setNovaFoto] = useState({
    titulo: '',
    categoria: 'Corporativo',
    data: new Date().toLocaleDateString('pt-BR'),
    url: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleOpenDialog = (foto = null) => {
    if (foto) {
      setEditingPhoto(foto);
      setNovaFoto(foto);
    } else {
      setEditingPhoto(null);
      setNovaFoto({
        titulo: '',
        categoria: 'Corporativo',
        data: new Date().toLocaleDateString('pt-BR'),
        url: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhoto(null);
    setNovaFoto({
      titulo: '',
      categoria: 'Corporativo',
      data: new Date().toLocaleDateString('pt-BR'),
      url: '',
    });
  };

  const handleSavePhoto = () => {
    if (editingPhoto) {
      // Editar foto existente
      setFotos(fotos.map(f => f.id === editingPhoto.id ? { ...novaFoto, id: editingPhoto.id } : f));
      setSnackbarMessage('Foto atualizada com sucesso!');
    } else {
      // Adicionar nova foto
      const newId = Math.max(...fotos.map(f => f.id)) + 1;
      setFotos([...fotos, { ...novaFoto, id: newId }]);
      setSnackbarMessage('Foto adicionada com sucesso!');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleDeletePhoto = (id) => {
    setFotos(fotos.filter(f => f.id !== id));
    setSnackbarMessage('Foto removida com sucesso!');
    setOpenSnackbar(true);
  };

  const handleChange = (field) => (event) => {
    setNovaFoto({ ...novaFoto, [field]: event.target.value });
  };

  const handlePreview = () => {
    window.open('/fotos', '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gerenciar Fotos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione, edite ou remova fotos da galeria pública
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handlePreview}>
            Visualizar Galeria
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Adicionar Foto
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Fotos na Galeria ({fotos.length})
        </Typography>
        
        {fotos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhuma foto cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adicione fotos para exibir na galeria pública
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Adicionar Primeira Foto
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {fotos.map((foto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={foto.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={foto.url}
                    alt={foto.titulo}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" noWrap>{foto.titulo}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip label={foto.categoria} size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {foto.data}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(foto)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePhoto(foto.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialog para Adicionar/Editar Foto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPhoto ? 'Editar Foto' : 'Adicionar Nova Foto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Título da Foto"
              value={novaFoto.titulo}
              onChange={handleChange('titulo')}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={novaFoto.categoria}
                onChange={handleChange('categoria')}
                label="Categoria"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Data do Evento"
              value={novaFoto.data}
              onChange={handleChange('data')}
              margin="normal"
              placeholder="DD/MM/AAAA"
            />

            <TextField
              fullWidth
              label="URL da Imagem"
              value={novaFoto.url}
              onChange={handleChange('url')}
              margin="normal"
              placeholder="https://..."
              helperText="Cole a URL de uma imagem da internet"
            />

            {novaFoto.url && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pré-visualização:
                </Typography>
                <img
                  src={novaFoto.url}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+não+encontrada';
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSavePhoto} 
            variant="contained"
            disabled={!novaFoto.titulo || !novaFoto.url}
          >
            {editingPhoto ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}