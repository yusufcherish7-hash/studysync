import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { Notifications as NotificationsIcon, ArrowBack, Circle } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate('/');
      else fetchNotifications(data.user.id);
    };
    getUser();
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    if (data) setNotifications(data);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        px: 4, py: 3,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>StudySync</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', border: '1px solid', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
          Back
        </Button>
      </Box>

      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Notifications</Typography>
            <Typography variant="body1" color="text.secondary">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Chip label={unreadCount} sx={{ backgroundColor: '#4F46E5', color: 'white', fontWeight: 700 }} />
          )}
        </Box>

        {notifications.length === 0 ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No notifications yet</Typography>
            <Typography variant="body2" color="text.secondary">You'll see notifications here when something happens</Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <List disablePadding>
              {notifications.map((notification, index) => (
                <ListItem
                  key={notification.id}
                  divider={index < notifications.length - 1}
                  sx={{
                    backgroundColor: notification.is_read ? 'transparent' : '#EEF2FF',
                    px: 3, py: 2,
                    '&:hover': { backgroundColor: '#F8FAFC' }
                  }}
                  secondaryAction={
                    !notification.is_read && (
                      <Button size="small" variant="outlined" onClick={() => markAsRead(notification.id)} sx={{ borderRadius: 2 }}>
                        Mark read
                      </Button>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Circle sx={{ fontSize: 10, color: notification.is_read ? '#CBD5E1' : '#4F46E5' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography fontWeight={notification.is_read ? 400 : 600}>{notification.message}</Typography>}
                    secondary={notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Just now'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default Notifications;