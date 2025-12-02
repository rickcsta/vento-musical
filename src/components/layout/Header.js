'use client'; // CERTIFIQUE-SE QUE TEM ISSO NO TOPO

import { useState, useEffect } from 'react'; // Adicionar useEffect
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';

const navItems = [
  { name: 'Início', href: '/', icon: <HomeIcon /> },
  { name: 'Sobre Nós', href: '/sobre-nos', icon: <InfoIcon /> },
  { name: 'Fotos', href: '/fotos', icon: <PhotoCamera /> },
  { name: 'Eventos', href: '/eventos', icon: <EventIcon /> },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Adicionar estado para controle

  // Evitar renderização no servidor
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Se não estiver montado (no servidor), renderizar versão simplificada
  if (!mounted) {
    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
              }}
            >
              VENTO MUSICAL
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - SEM Link durante SSR */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <EventIcon sx={{ mr: 1 }} />
              VENTO MUSICAL
            </Typography>

            {/* Menu Desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{ color: 'white', mx: 1 }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* Link Admin */}
            <Button
              component={Link}
              href="/admin"
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Admin
            </Button>

            {/* Menu Mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer Mobile */}
      {mobileOpen && (
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <List>
              {navItems.map((item) => (
                <ListItem 
                  key={item.name} 
                  button 
                  component={Link} 
                  href={item.href}
                  onClick={handleDrawerToggle}
                >
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
              <ListItem 
                button 
                component={Link} 
                href="/admin"
                onClick={handleDrawerToggle}
              >
                <ListItemText primary="Área Admin" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
}