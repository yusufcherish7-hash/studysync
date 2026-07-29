import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip } from '@mui/material';
import { Add, CalendarMonth, ArrowBack, LocationOn, AccessTime } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate('/');
      else {
        setUser(data.user);
        fetchSessions();
        fetchGroups();
      }
    };
    getUser();
  }, [navigate]);

  const fetchSessions = async () => {
    const { data } = await supabase.from('study_sessions').select('*').order('scheduled_at', { ascending: true });
    if (data) setSessions(data);
  };

  const fetchGroups = async () => {
    const { data } = await supabase.from('study_groups').select('*');
    if (data) setGroups(data);
  };

  const handleCreateSession = async () => {
    const { error } = await supabase.from('study_sessions').insert([{
      title: title,
      description: description,
      location: location,
      scheduled_at: scheduledAt || null,
      group_id: selectedGroup || null,
      created_by: user.id,
    }]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setOpen(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setScheduledAt('');
      setSelectedGroup('');
      fetchSessions();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleString();
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Study Sessions</Typography>
            <Typography variant="body1" color="text.secondary">Schedule and manage your study sessions</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ py: 1.5, px: 3 }}>
            Schedule Session
          </Button>
        </Box>

        <Grid container spacing={3}>
          {sessions.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
                <CalendarMonth sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No sessions scheduled yet</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Schedule your first study session!</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Schedule Session</Button>
              </Paper>
            </Grid>
          )}
          {sessions.map((session) => (
            <Grid item xs={12} sm={6} md={4} key={session.id}>
              <Paper sx={{
                p: 3, borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
              }}>
                <Box sx={{ backgroundColor: '#F0FDF4', borderRadius: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ color: '#4F46E5' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} mb={1}>{session.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="body2" color="text.secondary">{session.location || 'No location set'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="body2" color="text.secondary">{formatDate(session.scheduled_at)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{session.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight={700}>Schedule Study Session</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={3} />
          <TextField fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} margin="normal" />
          <TextField fullWidth label="Date & Time" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth select label="Study Group" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} margin="normal">
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSession}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sessions;