import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Stack, Paper 
} from '@mui/material';
// UBAH BARIS INI: Pisahkan import tipe data (type) dengan komponen
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid'; 
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { activeTeamId } = useAuth();
  const [targets, setTargets] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', host: '', port: '', protocol: 'HTTP', interval_seconds: 60 });

  const fetchTargets = async () => {
    if (!activeTeamId) return;
    try {
      const res = await axios.get(`/api/teams/${activeTeamId}/targets`);
      setTargets(res.data.targets);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchTargets();
    const interval = setInterval(fetchTargets, 5000);
    return () => clearInterval(interval);
  }, [activeTeamId]);

  const handleSave = async () => {
    try {
      await axios.post(`/api/teams/${activeTeamId}/targets`, { ...form, port: form.port ? parseInt(form.port) : null });
      setOpen(false); fetchTargets();
    } catch (e) { alert("Gagal menyimpan target."); }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nama Target', width: 200 },
    { field: 'host', headerName: 'Host / URL', width: 250 },
    { field: 'protocol', headerName: 'Protokol', width: 100 },
    { field: 'current_status', headerName: 'Status', width: 150, renderCell: (p) => (<Typography color={p.value === 'UP' ? 'success.main' : 'error.main'} fontWeight="bold">{p.value}</Typography>) },
    { field: 'interval_seconds', headerName: 'Interval (s)', width: 100 },
  ];

  if (!activeTeamId) return <Typography color="error">Silakan buat Tim di menu Settings terlebih dahulu.</Typography>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Dashboard Monitoring</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>+ Target</Button>
      </Stack>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid rows={targets} columns={columns} />
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Target Baru</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nama Target" fullWidth required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <TextField label="Host / IP / URL" fullWidth required value={form.host} onChange={(e) => setForm({...form, host: e.target.value})} />
            <Stack direction="row" spacing={2}>
              <TextField select label="Protokol" fullWidth value={form.protocol} onChange={(e) => setForm({...form, protocol: e.target.value})}>
                <MenuItem value="HTTP">HTTP</MenuItem><MenuItem value="TCP">TCP</MenuItem>
              </TextField>
              <TextField label="Port" type="number" fullWidth value={form.port} onChange={(e) => setForm({...form, port: e.target.value})} />
            </Stack>
            <TextField label="Interval (Detik)" type="number" fullWidth required value={form.interval_seconds} onChange={(e) => setForm({...form, interval_seconds: parseInt(e.target.value)})} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button><Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
