'use client';

import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'; // CORREÇÃO AQUI
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { title: 'Fotos na Galeria', value: '24', icon: <PhotoLibraryIcon />, color: '#1976d2' },
    { title: 'Eventos Cadastrados', value: '6', icon: <EventIcon />, color: '#2e7d32' },
    { title: 'Páginas Editáveis', value: '3', icon: <EditIcon />, color: '#ed6c02' },
  ];

  const quickActions = [
    { text: 'Editar Sobre Nós', href: '/admin/sobre-nos', icon: <InfoIcon /> },
    { text: 'Adicionar Fotos', href: '/admin/fotos', icon: <AddAPhotoIcon /> }, // CORREÇÃO AQUI
    { text: 'Agendar Evento', href: '/admin/eventos', icon: <CalendarTodayIcon /> },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Gerencie o conteúdo do seu site nesta área.
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    backgroundColor: `${stat.color}20`, 
                    p: 1, 
                    borderRadius: '50%',
                    mr: 2
                  }}>
                    <Box sx={{ color: stat.color }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h3">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ações Rápidas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ações Rápidas
            </Typography>
            <List>
              {quickActions.map((action, index) => (
                <ListItem 
                  key={index}
                  secondaryAction={
                    <Button 
                      component={Link} 
                      href={action.href}
                      variant="outlined"
                      size="small"
                    >
                      Acessar
                    </Button>
                  }
                >
                  <ListItemIcon>
                    {action.icon}
                  </ListItemIcon>
                  <ListItemText primary={action.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dicas
            </Typography>
            <Typography variant="body2" paragraph>
              • Mantenha as informações sempre atualizadas
            </Typography>
            <Typography variant="body2" paragraph>
              • Use imagens de alta qualidade
            </Typography>
            <Typography variant="body2" paragraph>
              • Organize as fotos por categorias
            </Typography>
            <Typography variant="body2">
              • Revise o conteúdo antes de publicar
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}