import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Avatar } from '@mui/material';
import { Groups, CalendarMonth, FolderOpen, Notifications, Person } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/');
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const cards = [
    { title: 'Study Groups', description: 'Create and join study groups', icon: <Groups sx={{ fontSize: 32 }} />, path: '/groups', color: '#EEF2FF' },
    { title: 'Study Sessions', description: 'Schedule and view sessions', icon: <CalendarMonth sx={{ fontSize: 32 }} />, path: '/sessions', color: '#F0FDF4' },
    { title: 'Resources', description: 'Upload and download files', icon: <FolderOpen sx={{ fontSize: 32 }} />, path: '/resources', color: '#FFF7ED' },
    { title: 'Notifications', description: 'View your notifications', icon: <Notifications sx={{ fontSize: 32 }} />, path: '/notifications', color: '#FDF4FF' },
    { title: 'My Profile', description: 'Update your profile', icon: <Person sx={{ fontSize: 32 }} />, path: '/profile', color: '#F0F9FF' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        px: 4, py: 3,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>StudySync</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, fontSize: 14 }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Button variant="outlined" onClick={handleLogout} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 4, py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          {user?.email}
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Paper
                onClick={() => navigate(card.path)}
                sx={{
                  p: 3, borderRadius: 3, cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
                }}
              >
                <Box sx={{ backgroundColor: card.color, borderRadius: 2, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#4F46E5' }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">{card.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;