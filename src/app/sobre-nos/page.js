'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Grid, Avatar } from '@mui/material';
import MissionIcon from '@mui/icons-material/Flag';

export default function SobreNosPage() {
  const [sobre, setSobre] = useState(null);
  const [equipe, setEquipe] = useState([]);

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
        <Typography align="center" variant="h6">Carregando informações...</Typography>
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
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
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
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {sobre.missao}
        </Typography>
      </Paper>

      {/* Equipe */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Nossa Equipe
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {equipe.map((membro) => (
            <Grid item xs={12} sm={6} md={4} key={membro.id}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={membro.fotoUrl || undefined} // usa fotoUrl
                  alt={membro.nome}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 16px',
                    border: '4px solid',
                    borderColor: 'primary.main',
                    bgcolor: !membro.fotoUrl ? 'primary.light' : undefined,
                  }}
                >
                  {!membro.fotoUrl && membro.nome.slice(0, 1).toUpperCase()} 
                </Avatar>
                <Typography variant="h6">
                  {membro.nome}
                </Typography>
                <Typography color="text.secondary">
                  {membro.cargo}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
