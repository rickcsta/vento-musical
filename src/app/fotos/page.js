'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/ZoomIn';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';

// Dados iniciais de fotos
const fotosIniciais = [
  { id: 1, url: 'https://source.unsplash.com/random?event1', titulo: 'Evento Corporativo 2024', categoria: 'Corporativo', data: '15/03/2024' },
  { id: 2, url: 'https://source.unsplash.com/random?event2', titulo: 'Casamento Verão', categoria: 'Casamento', data: '10/02/2024' },
  { id: 3, url: 'https://source.unsplash.com/random?event3', titulo: 'Aniversário Infantil', categoria: 'Festa', data: '05/02/2024' },
  { id: 4, url: 'https://source.unsplash.com/random?event4', titulo: 'Workshop Fotografia', categoria: 'Workshop', data: '28/01/2024' },
  { id: 5, url: 'https://source.unsplash.com/random?event5', titulo: 'Formatura 2023', categoria: 'Formatura', data: '20/12/2023' },
  { id: 6, url: 'https://source.unsplash.com/random?event6', titulo: 'Evento Beneficente', categoria: 'Beneficente', data: '15/12/2023' },
];

const categorias = ['Todos', 'Corporativo', 'Casamento', 'Festa', 'Workshop', 'Formatura', 'Beneficente'];

export default function FotosPage() {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [fotoExpandida, setFotoExpandida] = useState(null);

  const filtrarFotos = () => {
    let filtradas = fotosIniciais;
    
    // Filtro por categoria
    if (categoriaSelecionada !== 'Todos') {
      filtradas = filtradas.filter(foto => foto.categoria === categoriaSelecionada);
    }
    
    // Filtro por busca
    if (busca) {
      filtradas = filtradas.filter(foto => 
        foto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        foto.categoria.toLowerCase().includes(busca.toLowerCase())
      );
    }
    
    setFotos(filtradas);
  };

  const handleCategoriaClick = (categoria) => {
    setCategoriaSelecionada(categoria);
    if (categoria === 'Todos') {
      setFotos(fotosIniciais);
    } else {
      setFotos(fotosIniciais.filter(foto => foto.categoria === categoria));
    }
  };

  const handleSearch = (e) => {
    setBusca(e.target.value);
    if (e.target.value === '') {
      setFotos(fotosIniciais);
    } else {
      setFotos(fotosIniciais.filter(foto => 
        foto.titulo.toLowerCase().includes(e.target.value.toLowerCase())
      ));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PhotoAlbumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom color="primary">
          Galeria de Fotos
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Momentos especiais capturados em nossos eventos
        </Typography>
      </Box>

      {/* Filtros e Busca */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Buscar fotos por título ou categoria..."
          value={busca}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categorias.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleCategoriaClick(cat)}
              color={categoriaSelecionada === cat ? 'primary' : 'default'}
              variant={categoriaSelecionada === cat ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Grid de Fotos */}
      <Grid container spacing={3}>
        {fotos.map((foto) => (
          <Grid item xs={12} sm={6} md={4} key={foto.id}>
            <Card sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="250"
                image={foto.url}
                alt={foto.titulo}
                sx={{ cursor: 'pointer' }}
                onClick={() => setFotoExpandida(foto)}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '4px'
              }}>
                <IconButton 
                  size="small" 
                  onClick={() => setFotoExpandida(foto)}
                  sx={{ color: 'white' }}
                >
                  <ExpandIcon />
                </IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">{foto.titulo}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip label={foto.categoria} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {foto.data}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={fotoExpandida.url}
                alt={fotoExpandida.titulo}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5">{fotoExpandida.titulo}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip label={fotoExpandida.categoria} />
                  <Typography color="text.secondary">
                    Data: {fotoExpandida.data}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// Import faltante
import { Paper } from '@mui/material';