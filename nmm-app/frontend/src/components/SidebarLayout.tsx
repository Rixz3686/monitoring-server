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
