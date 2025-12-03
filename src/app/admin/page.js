'use client';

import { 
  Grid,  
  Typography, 
  Box, 
  Card, 
  CardContent,

} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'; 
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useSession} from "next-auth/react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const stats = [
    { title: 'Fotos na Galeria', value: '24', icon: <PhotoLibraryIcon />, color: '#1976d2' },
    { title: 'Eventos Cadastrados', value: '6', icon: <EventIcon />, color: '#2e7d32' },
    
  ];

  const quickActions = [
    { text: 'Editar Sobre Nós', href: '/admin/sobre-nos', icon: <InfoIcon /> },
    { text: 'Adicionar Fotos', href: '/admin/fotos', icon: <AddAPhotoIcon /> }, 
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
    </>
  );
}