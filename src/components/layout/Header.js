'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
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
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Image from "next/image";

const navItems = [
  { name: 'Início', href: '/', icon: <HomeIcon /> },
  { name: 'Sobre Nós', href: '/sobre-nos', icon: <InfoIcon /> },
  { name: 'Fotos', href: '/fotos', icon: <PhotoCamera /> },
  { name: 'Eventos', href: '/eventos', icon: <EventIcon /> },
];

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };

  // Se não estiver montado (no servidor), renderizar versão simplificada
   if (!mounted) return null;

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin' || session?.user?.email?.includes('admin');

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - lado esquerdo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                flexGrow: { xs: 1, md: 0 }, // No mobile ocupa todo espaço, no desktop não
              }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                style={{ marginRight: 8 }}
              />
              VENTO MUSICAL
            </Typography>

            {/* Menu Desktop - centro */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'start'}}>
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

            {/* Seção direita - Desktop */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              gap: 1 
            }}>
              {isAuthenticated ? (
                <>
                  {/* Botão Gerenciamento */}
                  <Button
                    component={Link}
                    href="/admin"
                    variant="contained"
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    Gerenciamento
                  </Button>

                  {/* Menu do Usuário */}
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{ color: 'white' }}
                  >
                    {session?.user?.image ? (
                      <Avatar 
                        src={session.user.image} 
                        alt={session.user.name || 'Usuário'}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: 'primary.light'
                        }}
                      >
                        {session?.user?.name?.[0] || 'U'}
                      </Avatar>
                    )}
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {session?.user?.name || session?.user?.email}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} href="/admin" onClick={handleMenuClose}>
                      <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                      Painel Admin
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                      Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                // Botão de Login
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Admin Login
                </Button>
              )}
            </Box>

            {/* Apenas as 3 barrinhas no Mobile - canto direito */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, ml: 'auto' }} // ml: 'auto' empurra para direita
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer Mobile */}
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
            {/* Menu Principal */}
            {navItems.map((item) => (
              <ListItem 
                key={item.name} 
                disablePadding
              >
                <ListItemButton 
                  component={Link} 
                  href={item.href}
                  onClick={handleDrawerToggle}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Seção Admin */}
            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton disabled>
                    <ListItemText 
                      primary="Administração" 
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        color: 'text.secondary' 
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
                
                {/* Informações do usuário no drawer mobile */}
                <ListItem disablePadding>
                  <ListItemButton disabled>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        mr: 2,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {session?.user?.name?.[0] || 'U'}
                    </Avatar>
                    <ListItemText 
                      primary={session?.user?.name || 'Usuário'} 
                      secondary={session?.user?.email}
                      primaryTypographyProps={{ 
                        variant: 'body2' 
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton 
                    component={Link} 
                    href="/admin"
                    onClick={handleDrawerToggle}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 2, fontSize: 20 }} />
                    <ListItemText primary="Painel Admin" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      handleDrawerToggle();
                      signOut({ callbackUrl: '/' });
                    }}
                  >
                    <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                    <ListItemText primary="Sair" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  href="/login"
                  onClick={handleDrawerToggle}
                >
                  <LoginIcon sx={{ mr: 2, fontSize: 20 }} />
                  <ListItemText primary="Login Admin" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}