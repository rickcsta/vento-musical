'use client';

import { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditarSobreNos() {
  const [dados, setDados] = useState({
    titulo: "",
    descricao: "",
    missao: "",
    equipe: []
  });
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [novoMembro, setNovoMembro] = useState({ nome: '', cargo: '', fotoUrl: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [membroParaRemover, setMembroParaRemover] = useState(null);

  // Carregar dados
  useEffect(() => {
    fetch('/api/sobre-nos/exibir')
      .then(res => res.json())
      .then(data => {
        const carregado = {
          titulo: data.sobre_nos.titulo,
          descricao: data.sobre_nos.descricao,
          missao: data.sobre_nos.missao,
          equipe: data.equipe.map(m => ({ 
            id: m.id, // Adiciona ID para controle
            nome: m.nome, 
            cargo: m.cargo, 
            fotoUrl: m.fotoUrl || '' 
          }))
        };
        setDados(carregado);
        setDadosOriginais(JSON.parse(JSON.stringify(carregado)));
      });
  }, []);

  const algoMudou = JSON.stringify(dados) !== JSON.stringify(dadosOriginais);

  const handleChange = campo => e => setDados({ ...dados, [campo]: e.target.value });
  const handleMembroChange = campo => e => setNovoMembro({ ...novoMembro, [campo]: e.target.value });

  const handleMembroFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    setNovoMembro({ ...novoMembro, fotoUrl: data.url });
  };

  const addMembro = () => {
    if (novoMembro.nome && novoMembro.cargo) {
      const novoId = Math.max(0, ...dados.equipe.map(m => m.id)) + 1;
      setDados({ 
        ...dados, 
        equipe: [...dados.equipe, { ...novoMembro, id: novoId }] 
      });
      setNovoMembro({ nome: '', cargo: '', fotoUrl: '' });
    }
  };

  const confirmRemoveMembro = (index) => {
    setMembroParaRemover(index);
    setOpenDeleteDialog(true);
  };

  const removeMembro = () => {
    if (membroParaRemover !== null) {
      const novaEquipe = dados.equipe.filter((_, i) => i !== membroParaRemover);
      setDados({ ...dados, equipe: novaEquipe });
      setOpenDeleteDialog(false);
      setMembroParaRemover(null);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/sobre-nos/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sobre_nos: {
            id: 1,
            titulo: dados.titulo || "",
            missao: dados.missao || "",
            descricao: dados.descricao || "",
          },
          equipe: dados.equipe
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      const result = await response.json();
      setDadosOriginais(JSON.parse(JSON.stringify(dados)));
      setOpenSnackbar(true);

      console.log(`${result.fotosExcluidas || 0} fotos excluídas do blob`);

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar!");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Editar Página "Sobre Nós"
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Título</Typography>
        <TextField fullWidth value={dados.titulo} onChange={handleChange('titulo')} margin="normal" />

        <Typography variant="h6" sx={{ mt: 3 }}>Descrição</Typography>
        <TextField fullWidth multiline rows={4} value={dados.descricao} onChange={handleChange('descricao')} margin="normal" />

        <Typography variant="h6" sx={{ mt: 3 }}>Missão</Typography>
        <TextField fullWidth multiline rows={4} value={dados.missao} onChange={handleChange('missao')} margin="normal" />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Equipe</Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dados.equipe.map((membro, index) => (
            <Grid item xs={12} sm={6} md={4} key={membro.id || index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {membro.fotoUrl && (
                        <img 
                          src={membro.fotoUrl} 
                          alt={membro.nome} 
                          style={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }} 
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle1">{membro.nome}</Typography>
                        <Typography variant="body2" color="text.secondary">{membro.cargo}</Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      color="error" 
                      onClick={() => confirmRemoveMembro(index)}
                      aria-label="remover membro"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle1">Adicionar Membro</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Nome" 
              value={novoMembro.nome} 
              onChange={handleMembroChange('nome')} 
              size="small" 
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Cargo" 
              value={novoMembro.cargo} 
              onChange={handleMembroChange('cargo')} 
              size="small" 
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" component="label" fullWidth size="small">
              Upload Foto
              <input 
                type="file" 
                hidden 
                onChange={handleMembroFoto}
                accept="image/*"
              />
            </Button>
            {novoMembro.fotoUrl && (
              <img 
                src={novoMembro.fotoUrl} 
                alt="preview" 
                style={{ 
                  marginTop: 5, 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            )}
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

      {algoMudou && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
          >
            Salvar Alterações
          </Button>
        </Box>
      )}

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Alterações salvas com sucesso!
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmação para remover membro */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Remover Membro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este membro? 
          </DialogContentText>
          <DialogContentText>
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={removeMembro} color="error" autoFocus>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}