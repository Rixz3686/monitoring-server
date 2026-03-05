# 1. Buat folder terstruktur di dalam src
mkdir -p src/pages src/components src/context

# 2. Buat file AuthContext.tsx
cat << 'EOF' > src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('activeTeamId'));

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null); setActiveTeamId(null);
    localStorage.removeItem('user'); localStorage.removeItem('activeTeamId');
  };

  const setActiveTeam = (teamId: string) => {
    setActiveTeamId(teamId);
    localStorage.setItem('activeTeamId', teamId);
  };

  return (
    <AuthContext.Provider value={{ user, activeTeamId, login, logout, setActiveTeam }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOF

# 3. Buat file SidebarLayout.tsx
cat << 'EOF' > src/components/SidebarLayout.tsx
import React from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function SidebarLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>LGN Network Monitor</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{user?.email}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }} variant="permanent" anchor="left">
        <Toolbar><Typography variant="h6" color="primary" fontWeight="bold">NMM App</Typography></Toolbar>
        <Divider />
        <List>
          <ListItem disablePadding><ListItemButton onClick={() => navigate('/')}><ListItemText primary="Dashboard" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => navigate('/settings')}><ListItemText primary="Team Settings" /></ListItemButton></ListItem>
        </List>
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItem disablePadding><ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemText primary="Logout" /></ListItemButton></ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        <Outlet /> 
      </Box>
    </Box>
  );
}
EOF

# 4. Buat file Login.tsx
cat << 'EOF' > src/pages/Login.tsx
import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      login({ id: response.data.userId, email });
      navigate('/');
    } catch (error) { alert('Login gagal. Periksa email dan password.'); }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Login NMM App</Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Login</Button>
          <Link to="/register" style={{ textDecoration: 'none' }}>Belum punya akun? Daftar di sini</Link>
        </Box>
      </Paper>
    </Container>
  );
}
EOF

# 5. Buat file Register.tsx
cat << 'EOF' > src/pages/Register.tsx
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
EOF

# 6. Buat file Settings.tsx
cat << 'EOF' > src/pages/Settings.tsx
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
EOF

# 7. Buat file Dashboard.tsx
cat << 'EOF' > src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
EOF

# 8. Buat file App.tsx
cat << 'EOF' > src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
EOF
