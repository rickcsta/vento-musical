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
  const fileInputRef = useRef(null);
  
  // Referência para armazenar URLs blob ativas
  const blobUrlsRef = useRef(new Set());

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

    // Verifica tamanho
    if (file.size > 15 * 1024 * 1024) { // 15MB
      alert('A imagem é muito grande. Use uma foto menor (máximo 15MB).');
      e.target.value = ''; // Limpa o input
      return;
    }

    // Revoga URL blob anterior se existir
    if (novoMembro.fotoUrl && novoMembro.fotoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(novoMembro.fotoUrl);
      blobUrlsRef.current.delete(novoMembro.fotoUrl);
    }

    // Cria preview local
    const preview = URL.createObjectURL(file);
    blobUrlsRef.current.add(preview);

    setNovoMembro({
      ...novoMembro,
      fotoUrl: preview,
      file: file,
    });
  };

  const addMembro = () => {
    if (novoMembro.nome.trim() && novoMembro.cargo.trim()) {
      const novoId = Date.now() + Math.random();
      
      const novoMembroCompleto = {
        id: novoId,
        nome: novoMembro.nome.trim(),
        cargo: novoMembro.cargo.trim(),
        fotoUrl: novoMembro.fotoUrl,
        file: novoMembro.file,
        isNew: true,
      };

      setDados({ 
        ...dados, 
        equipe: [...dados.equipe, novoMembroCompleto]
      });

      // Resetar sem revogar a URL - ela agora pertence ao membro
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
      const membroRemovido = dados.equipe[membroParaRemover];
      
      // Revoga URL blob se for uma URL local
      if (membroRemovido.fotoUrl && membroRemovido.fotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(membroRemovido.fotoUrl);
        blobUrlsRef.current.delete(membroRemovido.fotoUrl);
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
          // Se tem arquivo para upload (novo membro ou foto alterada)
          if (membro.file) {
            try {
              setUploadProgress(prev => ({ ...prev, [index]: 0 }));
              
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
              setUploadProgress(prev => ({ ...prev, [index]: 100 }));
              
              // Revoga URL blob local se existir
              if (membro.fotoUrl && membro.fotoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(membro.fotoUrl);
                blobUrlsRef.current.delete(membro.fotoUrl);
              }
              
              return { 
                ...membro, 
                fotoUrl: uploaded.url, 
                file: null,
                isNew: false 
              };
            } catch (uploadError) {
              console.error('Erro no upload da foto:', uploadError);
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
      alert("Erro ao salvar! " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Limpa todas as URLs blob quando o componente desmonta
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // Função para renderizar avatar com tratamento de erro
  const renderAvatar = (membro, index) => {
    const handleImageError = (e) => {
      // Se a imagem falhar ao carregar, remove o src
      e.target.style.display = 'none';
    };

    if (membro.fotoUrl && membro.fotoUrl.startsWith('blob:')) {
      // Para URLs blob, usa uma abordagem mais simples
      return (
        <Box sx={{ 
          width: 60, 
          height: 60, 
          borderRadius: '50%',
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {membro.fotoUrl && (
            <img 
              src={membro.fotoUrl} 
              alt={membro.nome}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={handleImageError}
            />
          )}
          {!membro.fotoUrl && <PersonIcon sx={{ color: 'grey.500' }} />}
        </Box>
      );
    } else if (membro.fotoUrl) {
      // Para URLs remotas
      return (
        <Box sx={{ 
          width: 60, 
          height: 60, 
          borderRadius: '50%',
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img 
            src={membro.fotoUrl} 
            alt={membro.nome}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={handleImageError}
          />
        </Box>
      );
    } else {
      // Sem foto
      return (
        <Box sx={{ 
          width: 60, 
          height: 60, 
          borderRadius: '50%',
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <PersonIcon sx={{ color: 'grey.500' }} />
        </Box>
      );
    }
  };

  // Função para renderizar preview do novo membro
  const renderPreviewAvatar = () => {
    if (!novoMembro.fotoUrl) return null;

    const handleImageError = (e) => {
      e.target.style.display = 'none';
    };

    return (
      <Box sx={{ 
        width: 50, 
        height: 50, 
        borderRadius: '50%',
        bgcolor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <img 
          src={novoMembro.fotoUrl} 
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={handleImageError}
        />
      </Box>
    );
  };

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
        />
      </Paper>

      {/* Seção Equipe */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Equipe ({dados.equipe.length} membro{dados.equipe.length !== 1 ? 's' : ''})
        </Typography>

        {/* Lista de Membros */}
        {dados.equipe.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {dados.equipe.map((membro, index) => (
              <Grid item xs={12} sm={6} md={4} key={membro.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px'
                }}>
                  <CardContent sx={{ 
                    p: 2, 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      flexGrow: 1
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 2, 
                        flex: 1,
                        minWidth: 0
                      }}>
                        {renderAvatar(membro, index)}
                        <Box sx={{ 
                          flex: 1, 
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography 
                            variant="subtitle1" 
                            noWrap 
                            sx={{ 
                              fontWeight: 'bold',
                              mb: 0.5
                            }}
                          >
                            {membro.nome}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1
                            }}
                          >
                            {membro.cargo}
                          </Typography>
                          {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                              <CircularProgress size={16} />
                              <Typography variant="caption" color="text.secondary">
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
                        sx={{ 
                          ml: 1,
                          flexShrink: 0,
                          alignSelf: 'flex-start'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            mb: 2,
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography color="text.secondary">
              Nenhum membro na equipe ainda
            </Typography>
          </Box>
        )}

        {/* Formulário para Adicionar Membro */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Adicionar Novo Membro
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
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
            <Grid item xs={12} sm={5}>
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
            <Grid item xs={12} sm={2}>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth 
                size="small"
                startIcon={<CloudUploadIcon />}
                sx={{ height: '40px' }}
              >
                Foto
                <input 
                  type="file" 
                  hidden 
                  onChange={handleMembroFoto}
                  accept="image/*"
                  ref={fileInputRef}
                />
              </Button>
            </Grid>
          </Grid>
          
          {/* Preview da foto selecionada */}
          {novoMembro.fotoUrl && (
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 1,
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300'
            }}>
              {renderPreviewAvatar()}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" noWrap>
                  {novoMembro.file?.name || 'Imagem selecionada'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(novoMembro.file?.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
              <Button 
                size="small" 
                color="error"
                onClick={() => {
                  // Revoga URL blob antes de remover
                  if (novoMembro.fotoUrl && novoMembro.fotoUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(novoMembro.fotoUrl);
                    blobUrlsRef.current.delete(novoMembro.fotoUrl);
                  }
                  setNovoMembro(prev => ({ ...prev, fotoUrl: '', file: null }));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remover
              </Button>
            </Box>
          )}
          
          <Button 
            onClick={addMembro} 
            startIcon={<AddIcon />} 
            sx={{ mt: 2 }}
            disabled={!novoMembro.nome.trim() || !novoMembro.cargo.trim()}
            variant="contained"
            size="medium"
            fullWidth
          >
            Adicionar Membro
          </Button>
        </Paper>
        
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Dica: Escolha fotos da galeria. Tamanho máximo: 15MB.
        </Typography>
      </Paper>

      {/* Botão Salvar */}
      {algoMudou && (
        <Box sx={{ 
          position: { xs: 'fixed', sm: 'static' }, 
          bottom: { xs: 0, sm: 'auto' },
          left: 0,
          right: 0,
          bgcolor: 'background.paper', 
          py: 2, 
          px: 2,
          borderTop: { xs: '1px solid', sm: 'none' },
          borderColor: 'divider',
          zIndex: 1000,
          boxShadow: { xs: 3, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'center', sm: 'flex-end' },
            maxWidth: 'lg',
            mx: 'auto'
          }}>
            <Button 
              variant="contained" 
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
              onClick={handleSave}
              size="large"
              disabled={isSaving}
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                py: { xs: 1.5, sm: 1 }
              }}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Espaço extra no mobile para o botão fixo não cobrir conteúdo */}
      {algoMudou && <Box sx={{ height: { xs: '80px', sm: 0 } }} />}

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