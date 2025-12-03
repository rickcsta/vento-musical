'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { signIn, useSession, getSession } from "next-auth/react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { data: session, status } = useSession();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        alert("Credenciais inválidas!");
        return;
      }

      setOpenSnackbar(true);

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Erro ao realizar login.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        
        <LoginIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />

        <Typography variant="h4" gutterBottom>
          Entrar
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, opacity: 0.7 }}>
          Acesse sua conta administrativa
        </Typography>

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Senha"
          type="password"
          margin="normal"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          startIcon={<LoginIcon />}
          sx={{ mt: 3, py: 1.2 }}
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">Login realizado com sucesso!</Alert>
      </Snackbar>
    </Container>
  );
}
