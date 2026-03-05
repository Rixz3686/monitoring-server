import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { activeTeamId, setActiveTeam } = useAuth();
  const [teamName, setTeamName] = useState('');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/teams', { name: teamName });
      setActiveTeam(response.data.teamId);
      alert('Tim berhasil dibuat dan diaktifkan!'); setTeamName('');
    } catch (error) { alert('Gagal membuat tim.'); }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" mb={3}>Pengaturan Tim</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Buat Tim Baru</Typography>
        <Box component="form" onSubmit={handleCreateTeam}>
          <Stack direction="row" spacing={2}>
            <TextField label="Nama Tim" fullWidth required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            <Button type="submit" variant="contained">Buat</Button>
          </Stack>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Status Tim Saat Ini</Typography>
        {activeTeamId ? (
          <Typography>ID Tim Aktif: <strong>{activeTeamId}</strong></Typography>
        ) : (
          <Alert severity="warning">Buat tim terlebih dahulu agar bisa menggunakan Dashboard.</Alert>
        )}
      </Paper>
    </Box>
  );
}
