'use client';

import { 
  Grid,  
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useSession} from "next-auth/react";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [contagem, setContagem] = useState({ 
    fotos: 0, 
    eventos: 0, 
    membros: 0 
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Buscar fotos
        const fotosRes = await fetch('/api/fotos/exibir');
        if (fotosRes.ok) {
          const fotos = await fotosRes.json();
          setContagem(prev => ({ ...prev, fotos: fotos.length }));
        }
        
        // Buscar eventos
        const eventosRes = await fetch('/api/evento/exibir');
        if (eventosRes.ok) {
          const eventos = await eventosRes.json();
          setContagem(prev => ({ ...prev, eventos: eventos.length }));
        }
        
        // Buscar membros da equipe
        // Vou criar um endpoint simples para isso
        const membrosRes = await fetch('/api/equipe/contar');
if (membrosRes.ok) {
  const dados = await membrosRes.json();
  setContagem(prev => ({ 
    ...prev, 
    membros: dados.total || 0 
  }));
}
        
      } catch (error) {
        console.log(error);
      }
    };
    
    buscarDados();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo
      </Typography>

      {/* Contadores */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PhotoLibraryIcon sx={{ color: '#1976d2', mb: 1 }} />
              <Typography variant="h5">{contagem.fotos}</Typography>
              <Typography variant="body2">Fotos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <EventIcon sx={{ color: '#2e7d32', mb: 1 }} />
              <Typography variant="h5">{contagem.eventos}</Typography>
              <Typography variant="body2">Eventos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PeopleIcon sx={{ color: '#9c27b0', mb: 1 }} />
              <Typography variant="h5">{contagem.membros}</Typography>
              <Typography variant="body2">Membros</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}