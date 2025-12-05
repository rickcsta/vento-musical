'use client';

import { useEffect, useState, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function EditarSobreNos() {
  const [dados, setDados] = useState({
    titulo: "",
    descricao: "",
    missao: "",
    equipe: []
  });
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    cargo: '',
    fotoUrl: '',
    file: null,
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [membroParaRemover, setMembroParaRemover] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch('/api/sobre-nos/exibir');
        const data = await response.json();
        
        const carregado = {
          titulo: data.sobre_nos.titulo,
          descricao: data.sobre_nos.descricao,
          missao: data.sobre_nos.missao,
          equipe: data.equipe.map(m => ({ 
            id: m.id || Date.now() + Math.random(),
            nome: m.nome, 
            cargo: m.cargo, 
            fotoUrl: m.fotoUrl || '' 
          }))
        };
        setDados(carregado);
        setDadosOriginais(JSON.parse(JSON.stringify(carregado)));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Tente novamente.');
      }
    };

    carregarDados();
  }, []);

  const algoMudou = dadosOriginais ? JSON.stringify(dados) !== JSON.stringify(dadosOriginais) : false;

  const handleChange = campo => e => setDados({ ...dados, [campo]: e.target.value });
  
  const handleMembroChange = campo => e => setNovoMembro({ ...novoMembro, [campo]: e.target.value });

  const handleMembroFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica tamanho para mobile
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('A imagem é muito grande. Use uma foto menor (máximo 10MB).');
      e.target.value = ''; // Limpa o input
      return;
    }

    // Cria preview local
    const preview = URL.createObjectURL(file);

    setNovoMembro({
      ...novoMembro,
      fotoUrl: preview,
      file: file,
    });
  };

  const addMembro = () => {
    if (novoMembro.nome && novoMembro.cargo) {
      const novoId = Math.max(0, ...dados.equipe.map(m => m.id)) + 1;

      setDados({ 
        ...dados, 
        equipe: [
          ...dados.equipe, 
          { 
            ...novoMembro, 
            id: novoId,
            isNew: true, // Marca como novo para upload
          }
        ]
      });

      // Resetar
      setNovoMembro({ nome: '', cargo: '', fotoUrl: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (isSaving) return; // Previne múltiplos cliques
    
    setIsSaving(true);
    setUploadProgress({});

    try {
      // Primeiro, fazer upload das fotos dos novos membros
      const equipeComUploads = await Promise.all(
        dados.equipe.map(async (membro, index) => {
          // Se tem arquivo para upload (novo membro ou foto alterada)
          if (membro.file) {
            try {
              setUploadProgress(prev => ({ ...prev, [index]: 0 }));
              
              const form = new FormData();
              form.append("file", membro.file);

              // Upload com timeout para mobile
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

              const upload = await fetch("/api/upload", {
                method: "POST",
                body: form,
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              if (!upload.ok) {
                const errorText = await upload.text();
                throw new Error(`Falha no upload: ${errorText}`);
              }

              const uploaded = await upload.json();
              setUploadProgress(prev => ({ ...prev, [index]: 100 }));
              
              return { 
                ...membro, 
                fotoUrl: uploaded.url, 
                file: null,
                isNew: false 
              };
            } catch (uploadError) {
              console.error('Erro no upload da foto:', uploadError);
              // Se falhar, mantém o membro mas mostra alerta
              alert(`Erro ao enviar foto de ${membro.nome}. O membro será salvo sem foto.`);
              return { 
                ...membro, 
                file: null,
                fotoUrl: '',
                isNew: false 
              };
            }
          }
          
          // Se já tem URL, mantém como está
          return membro;
        })
      );

      // Prepara o payload para salvar
      const payload = {
        sobre_nos: {
          id: 1,
          titulo: dados.titulo || "",
          missao: dados.missao || "",
          descricao: dados.descricao || "",
        },
        equipe: equipeComUploads.map(membro => ({
          nome: membro.nome,
          cargo: membro.cargo,
          fotoUrl: membro.fotoUrl || ""
        }))
      };

      // Salva os dados
      const response = await fetch("/api/sobre-nos/editar", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao salvar: ${errorText}`);
      }

      const result = await response.json();
      
      // Atualiza estado
      const equipeAtualizada = equipeComUploads.map(membro => ({
        ...membro,
        file: undefined
      }));
      
      setDados({
        ...dados,
        equipe: equipeAtualizada
      });
      
      setDadosOriginais(JSON.parse(JSON.stringify({
        ...dados,
        equipe: equipeAtualizada
      })));
      
      setOpenSnackbar(true);
      setUploadProgress({});

    } catch (error) {
      console.error("Erro ao salvar:", error);
      
      // Mensagens amigáveis para mobile
      let errorMessage = "Erro ao salvar!";
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = "Tempo esgotado. Verifique sua conexão com a internet.";
      } else if (error.message.includes('network')) {
        errorMessage = "Problema de conexão. Verifique sua internet.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Limpa URLs de preview quando desmontar
  useEffect(() => {
    return () => {
      // Limpa todos os object URLs
      if (novoMembro.fotoUrl && novoMembro.fotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(novoMembro.fotoUrl);
      }
      dados.equipe.forEach(membro => {
        if (membro.fotoUrl && membro.fotoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(membro.fotoUrl);
        }
      });
    };
  }, [novoMembro.fotoUrl, dados.equipe]);

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Editar Página "Sobre Nós"
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Título</Typography>
        <TextField 
          fullWidth 
          value={dados.titulo} 
          onChange={handleChange('titulo')} 
          margin="normal"
          size="small"
        />

        <Typography variant="h6" sx={{ mt: 3 }}>Descrição</Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={4} 
          value={dados.descricao} 
          onChange={handleChange('descricao')} 
          margin="normal"
          size="small"
        />

        <Typography variant="h6" sx={{ mt: 3 }}>Missão</Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={4} 
          value={dados.missao} 
          onChange={handleChange('missao')} 
          margin="normal"
          size="small"
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Equipe</Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dados.equipe.map((membro, index) => (
            <Grid item xs={12} sm={6} md={4} key={membro.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {membro.fotoUrl ? (
                        <img 
                          src={membro.fotoUrl} 
                          alt={membro.nome} 
                          style={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: '50%',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="caption" color="text.secondary">
                            Sem foto
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {membro.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {membro.cargo}
                        </Typography>
                        {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <CircularProgress size={16} />
                            <Typography variant="caption">
                              {uploadProgress[index]}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <IconButton 
                      color="error" 
                      onClick={() => confirmRemoveMembro(index)}
                      aria-label="remover membro"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle1" gutterBottom>Adicionar Membro</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Nome" 
              value={novoMembro.nome} 
              onChange={handleMembroChange('nome')} 
              size="small" 
              required
              margin="none"
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
              margin="none"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="outlined" 
              component="label" 
              fullWidth 
              size="small"
              startIcon={<CloudUploadIcon />}
            >
              Foto
              <input 
                type="file" 
                hidden 
                onChange={handleMembroFoto}
                accept="image/*"
                capture="environment" // Usa câmera no mobile
                ref={fileInputRef}
              />
            </Button>
            {novoMembro.fotoUrl && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img 
                  src={novoMembro.fotoUrl} 
                  alt="preview" 
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  {novoMembro.file?.name?.substring(0, 20) || 'Preview'}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Button 
          onClick={addMembro} 
          startIcon={<AddIcon />} 
          sx={{ mt: 2 }}
          disabled={!novoMembro.nome || !novoMembro.cargo}
          variant="contained"
          size="small"
        >
          Adicionar Membro
        </Button>
      </Paper>

      {algoMudou && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            onClick={handleSave}
            size="large"
            disabled={isSaving}
            sx={{ minWidth: 200 }}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      )}

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Alterações salvas com sucesso!
        </Alert>
      </Snackbar>

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