'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

// Dados iniciais
const initialData = {
  titulo: "Sobre Nossa Empresa",
  descricao: "Somos uma empresa especializada em organização de eventos e registro fotográfico profissional. Com mais de 10 anos de experiência, transformamos momentos comuns em memórias inesquecíveis.",
  missao: "Proporcionar experiências únicas através de eventos bem planejados e registros fotográficos de alta qualidade.",
  visao: "Ser referência nacional em organização de eventos e fotografia profissional até 2030.",
  valores: ["Qualidade", "Comprometimento", "Inovação", "Satisfação do Cliente"],
  equipe: [
    { nome: "João Silva", cargo: "Diretor Geral", foto: "https://source.unsplash.com/random?person1" },
    { nome: "Maria Santos", cargo: "Fotógrafa Chefe", foto: "https://source.unsplash.com/random?person2" },
    { nome: "Carlos Oliveira", cargo: "Organizador de Eventos", foto: "https://source.unsplash.com/random?person3" },
  ]
};

export default function EditarSobreNos() {
  const [dados, setDados] = useState(initialData);
  const [novoValor, setNovoValor] = useState('');
  const [novoMembro, setNovoMembro] = useState({ nome: '', cargo: '', foto: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (campo) => (event) => {
    setDados({ ...dados, [campo]: event.target.value });
  };

  const handleValorChange = (index, value) => {
    const novosValores = [...dados.valores];
    novosValores[index] = value;
    setDados({ ...dados, valores: novosValores });
  };

  const addValor = () => {
    if (novoValor.trim()) {
      setDados({ ...dados, valores: [...dados.valores, novoValor] });
      setNovoValor('');
    }
  };

  const removeValor = (index) => {
    const novosValores = dados.valores.filter((_, i) => i !== index);
    setDados({ ...dados, valores: novosValores });
  };

  const handleMembroChange = (campo) => (event) => {
    setNovoMembro({ ...novoMembro, [campo]: event.target.value });
  };

  const addMembro = () => {
    if (novoMembro.nome && novoMembro.cargo) {
      setDados({ 
        ...dados, 
        equipe: [...dados.equipe, { 
          ...novoMembro, 
          foto: novoMembro.foto || 'https://source.unsplash.com/random?person'
        }] 
      });
      setNovoMembro({ nome: '', cargo: '', foto: '' });
    }
  };

  const removeMembro = (index) => {
    const novaEquipe = dados.equipe.filter((_, i) => i !== index);
    setDados({ ...dados, equipe: novaEquipe });
  };

  const handleSave = () => {
    // Aqui você faria a chamada para salvar no banco de dados
    console.log('Dados salvos:', dados);
    setOpenSnackbar(true);
  };

  const handlePreview = () => {
    // Abrir a página pública em nova aba
    window.open('/sobre-nos', '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Editar Página "Sobre Nós"
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Edite o conteúdo que aparece na página pública "Sobre Nós"
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Título Principal</Typography>
        <TextField
          fullWidth
          value={dados.titulo}
          onChange={handleChange('titulo')}
          margin="normal"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Descrição</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={dados.descricao}
          onChange={handleChange('descricao')}
          margin="normal"
        />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Missão</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={dados.missao}
              onChange={handleChange('missao')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Visão</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={dados.visao}
              onChange={handleChange('visao')}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Valores</Typography>
        <Box sx={{ mb: 2 }}>
          {dados.valores.map((valor, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                value={valor}
                onChange={(e) => handleValorChange(index, e.target.value)}
                size="small"
              />
              <IconButton onClick={() => removeValor(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Novo valor"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button onClick={addValor} startIcon={<AddIcon />}>
            Adicionar
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Equipe</Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dados.equipe.map((membro, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="subtitle1">{membro.nome}</Typography>
                      <Typography variant="body2" color="text.secondary">{membro.cargo}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => removeMembro(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img 
                      src={membro.foto} 
                      alt={membro.nome}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle1" gutterBottom>Adicionar Membro</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nome"
              value={novoMembro.nome}
              onChange={handleMembroChange('nome')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cargo"
              value={novoMembro.cargo}
              onChange={handleMembroChange('cargo')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="URL da Foto"
              value={novoMembro.foto}
              onChange={handleMembroChange('foto')}
              size="small"
              placeholder="https://..."
            />
          </Grid>
        </Grid>
        <Button 
          onClick={addMembro} 
          startIcon={<AddIcon />} 
          sx={{ mt: 2 }}
          disabled={!novoMembro.nome || !novoMembro.cargo}
        >
          Adicionar Membro
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePreview}
        >
          Visualizar Página
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Salvar Alterações
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Alterações salvas com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
}