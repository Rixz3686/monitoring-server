import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { email, password });
      alert('Registrasi berhasil! Silakan login.'); navigate('/login');
    } catch (error) { alert('Registrasi gagal.'); }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Daftar Akun</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" color="success" sx={{ mt: 3, mb: 2 }}>Register</Button>
          <Link to="/login" style={{ textDecoration: 'none' }}>Kembali ke Login</Link>
        </Box>
      </Paper>
    </Container>
  );
}
