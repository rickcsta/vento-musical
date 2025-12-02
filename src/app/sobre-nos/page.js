'use client';

import { Container, Typography, Paper, Box, Grid, Avatar, Card, CardContent } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import MissionIcon from '@mui/icons-material/Flag';
import VisionIcon from '@mui/icons-material/Visibility';

// Dados iniciais - serão substituídos pelo admin
const sobreNosData = {
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

export default function SobreNosPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" color="primary">
          {sobreNosData.titulo}
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {sobreNosData.descricao}
        </Typography>
      </Paper>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Missão */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <MissionIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Nossa Missão
              </Typography>
              <Typography>
                {sobreNosData.missao}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Visão */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <VisionIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Nossa Visão
              </Typography>
              <Typography>
                {sobreNosData.visao}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Valores */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <GroupsIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Nossos Valores
              </Typography>
              <Box sx={{ textAlign: 'left', pl: 2 }}>
                {sobreNosData.valores.map((valor, index) => (
                  <Typography key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    • {valor}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Equipe */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Nossa Equipe
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {sobreNosData.equipe.map((membro, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={membro.foto}
                  alt={membro.nome}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto 16px',
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                />
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