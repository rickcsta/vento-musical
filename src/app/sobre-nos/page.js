'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Grid, Avatar } from '@mui/material';
import MissionIcon from '@mui/icons-material/Flag';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function SobreNosPage() {
  const [sobre, setSobre] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const LIMITE_INICIAL = 6;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/sobre-nos/exibir');
        const json = await res.json();

        if (json.sobre_nos) setSobre(json.sobre_nos);
        if (json.equipe) setEquipe(json.equipe);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }

    fetchData();
  }, []);

  if (!sobre) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography align="center" variant="h6">
          Carregando informações...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Sobre Nós */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" color="primary">
          {sobre.titulo}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {sobre.descricao}
        </Typography>
      </Paper>

      {/* Missão */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <MissionIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        </Box>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Nossa Missão
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {sobre.missao}
        </Typography>
      </Paper>

      {/* Equipe */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Nossa Equipe
        </Typography>

        <Grid
          container
          spacing={2}              // 🔥 menos espaço entre cards
          sx={{ mt: 2 }}
          justifyContent="center"
        >
          {(mostrarTodos ? equipe : equipe.slice(0, LIMITE_INICIAL)).map((membro) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}                // 🔥 3 por linha (equilibrado)
              key={membro.id}
              display="flex"
              justifyContent="center"
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 240,    // 🔥 card mais compacto
                  height: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  src={membro.fotoUrl || undefined}
                  alt={membro.nome}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '4px solid',
                    borderColor: 'primary.main',
                    bgcolor: !membro.fotoUrl ? 'primary.light' : undefined,
                  }}
                >
                  {!membro.fotoUrl && membro.nome[0]}
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    minHeight: 56,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {membro.nome}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    minHeight: 24,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {membro.cargo}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Botão Ver todos */}
        {equipe.length > LIMITE_INICIAL && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box
              onClick={() => setMostrarTodos(!mostrarTodos)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'primary.main',
                fontWeight: 500,
                userSelect: 'none',
              }}
            >
              <Typography>
                {mostrarTodos ? 'Mostrar menos' : 'Ver todos'}
              </Typography>

              <ExpandMoreIcon
                sx={{
                  transition: 'transform 0.3s',
                  transform: mostrarTodos ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
