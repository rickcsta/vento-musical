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
  Avatar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PersonIcon from '@mui/icons-material/Person';

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

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch('/api/sobre-nos/exibir');
        const data = await response.json();
        
        const carregado = {
          titulo: data.sobre_nos?.titulo || "",
          descricao: data.sobre_nos?.descricao || "",
          missao: data.sobre_nos?.missao || "",
          equipe: (data.equipe || []).map(m => ({ 
            id: m.id || Date.now() + Math.random(),
            nome: m.nome || "", 
            cargo: m.cargo || "", 
            fotoUrl: m.fotoUrl || "" 
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

    // Verifica tamanho (15MB máximo para galeria)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      alert('A imagem é muito grande. Escolha uma foto menor (máximo 15MB).');
      e.target.value = ''; // Limpa o input
      return;
    }

    // Verifica se é imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      e.target.value = '';
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
    if (!novoMembro.nome.trim() || !novoMembro.cargo.trim()) {
      alert('Por favor, preencha nome e cargo.');
      return;
    }

    // Gera ID único baseado no timestamp
    const novoId = Date.now() + Math.floor(Math.random() * 1000);

    const novoMembroCompleto = {
      id: novoId,
      nome: novoMembro.nome.trim(),
      cargo: novoMembro.cargo.trim(),
      fotoUrl: novoMembro.fotoUrl,
      file: novoMembro.file,
      isNew: true, // Marca como novo para upload
    };

    setDados({ 
      ...dados, 
      equipe: [...dados.equipe, novoMembroCompleto]
    });

    // Resetar formulário
    setNovoMembro({ nome: '', cargo: '', fotoUrl: '', file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmRemoveMembro = (index) => {
    setMembroParaRemover(index);
    setOpenDeleteDialog(true);
  };

  const removeMembro = () => {
    if (membroParaRemover !== null) {
      const membroRemovido = dados.equipe[membroParaRemover];
      
      // Limpa URL de preview se existir
      if (membroRemovido.fotoUrl && membroRemovido.fotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(membroRemovido.fotoUrl);
      }

      const novaEquipe = dados.equipe.filter((_, i) => i !== membroParaRemover);
      setDados({ ...dados, equipe: novaEquipe });
      setOpenDeleteDialog(false);
      setMembroParaRemover(null);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setUploadProgress({});

    try {
      // Primeiro, fazer upload das fotos dos novos membros
      const equipeComUploads = await Promise.all(
        dados.equipe.map(async (membro, index) => {
          // Se tem arquivo para upload (novo membro com foto)
          if (membro.file) {
            try {
              setUploadProgress(prev => ({ ...prev, [membro.id]: 10 }));
              
              const form = new FormData();
              form.append("file", membro.file);

              const upload = await fetch("/api/upload", {
                method: "POST",
                body: form,
              });

              if (!upload.ok) {
                const errorText = await upload.text();
                throw new Error(`Falha no upload: ${errorText}`);
              }

              const uploaded = await upload.json();
              setUploadProgress(prev => ({ ...prev, [membro.id]: 100 }));
              
              // Limpa preview local se existir
              if (membro.fotoUrl && membro.fotoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(membro.fotoUrl);
              }
              
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
          id: membro.id,
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
      alert("Erro ao salvar! " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Limpa URLs de preview quando desmontar
  useEffect(() => {
    return () => {
      // Limpa preview do novo membro
      if (novoMembro.fotoUrl && novoMembro.fotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(novoMembro.fotoUrl);
      }
      // Limpa previews dos membros na lista
      dados.equipe.forEach(membro => {
        if (membro.fotoUrl && membro.fotoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(membro.fotoUrl);
        }
      });
    };
  }, [novoMembro.fotoUrl, dados.equipe]);

  return (
    <Container maxWidth="lg" sx={{ pb: 4, pt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Editar Página "Sobre Nós"
      </Typography>

      {/* Seção Sobre Nós */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Título</Typography>
        <TextField 
          fullWidth 
          value={dados.titulo} 
          onChange={handleChange('titulo')} 
          margin="normal"
          size="small"
          placeholder="Digite o título da página"
        />

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Descrição</Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={4} 
          value={dados.descricao} 
          onChange={handleChange('descricao')} 
          margin="normal"
          size="small"
          placeholder="Descreva sua empresa/organização"
        />

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Missão</Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={4} 
          value={dados.missao} 
          onChange={handleChange('missao')} 
          margin="normal"
          size="small"
          placeholder="Qual é a missão da sua empresa?"
        />
      </Paper>

      {/* Seção Equipe */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Equipe ({dados.equipe.length} membro{dados.equipe.length !== 1 ? 's' : ''})
        </Typography>

        {/* Lista de Membros */}
        {dados.equipe.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {dados.equipe.map((membro) => (
              <Grid item xs={12} sm={6} md={4} key={membro.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        {membro.fotoUrl ? (
                          <Avatar
                            src={membro.fotoUrl}
                            alt={membro.nome}
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: '2px solid',
                              borderColor: 'primary.light'
                            }}
                            onError={(e) => {
                              e.target.src = '';
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{ 
                              width: 60, 
                              height: 60,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText'
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                            {membro.nome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {membro.cargo}
                          </Typography>
                          {uploadProgress[membro.id] !== undefined && uploadProgress[membro.id] < 100 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <CircularProgress size={16} />
                              <Typography variant="caption" color="text.secondary">
                                Enviando... {uploadProgress[membro.id]}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <IconButton 
                        color="error" 
                        onClick={() => confirmRemoveMembro(dados.equipe.findIndex(m => m.id === membro.id))}
                        aria-label="remover membro"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, mb: 2 }}>
            <PersonIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography color="text.secondary">
              Nenhum membro na equipe ainda
            </Typography>
          </Box>
        )}

        {/* Formulário para Adicionar Membro */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Adicionar Novo Membro
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Nome completo" 
                value={novoMembro.nome} 
                onChange={handleMembroChange('nome')} 
                size="small"
                required
                margin="none"
                placeholder="Ex: João Silva"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Cargo/Função" 
                value={novoMembro.cargo} 
                onChange={handleMembroChange('cargo')} 
                size="small"
                required
                margin="none"
                placeholder="Ex: Diretor Executivo"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  size="small"
                  startIcon={<PhotoLibraryIcon />}
                >
                  Escolher da Galeria
                  <input 
                    type="file" 
                    hidden 
                    onChange={handleMembroFoto}
                    accept="image/*"
                    ref={fileInputRef}
                    // REMOVI o capture para permitir galeria
                  />
                </Button>
                {novoMembro.fotoUrl && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Avatar
                      src={novoMembro.fotoUrl}
                      alt="Preview"
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" display="block" noWrap>
                        {novoMembro.file?.name || 'Imagem selecionada'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(novoMembro.file?.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          <Button 
            onClick={addMembro} 
            startIcon={<AddIcon />} 
            sx={{ mt: 2 }}
            disabled={!novoMembro.nome.trim() || !novoMembro.cargo.trim()}
            variant="contained"
            size="medium"
            fullWidth
          >
            Adicionar à Equipe
          </Button>
        </Paper>
        
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Dica: Use fotos profissionais com fundo neutro. Tamanho máximo: 15MB.
        </Typography>
      </Paper>

      {/* Botão Salvar */}
      {algoMudou && (
        <Box sx={{ 
          position: 'sticky', 
          bottom: 0, 
          bgcolor: 'background.paper', 
          py: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
          </Container>
        </Box>
      )}

      {/* Notificação de Sucesso */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)} sx={{ width: '100%' }}>
          Alterações salvas com sucesso!
        </Alert>
      </Snackbar>

      {/* Diálogo de Confirmação para Remover */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Remover Membro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este membro da equipe?
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={removeMembro} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}