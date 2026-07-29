import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Add, Groups as GroupsIcon, ArrowBack } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate('/');
      else {
        setUser(data.user);
        fetchGroups();
      }
    };
    getUser();
  }, [navigate]);

  const fetchGroups = async () => {
    const { data } = await supabase.from('study_groups').select('*');
    if (data) setGroups(data);
  };

  const handleCreateGroup = async () => {
    const { error } = await supabase.from('study_groups').insert([{
      name: groupName,
      subject: subject,
      description: description,
      created_by: user.id,
    }]);
    if (!error) {
      setOpen(false);
      setGroupName('');
      setSubject('');
      setDescription('');
      fetchGroups();
    }
  };

  const handleJoinGroup = async (groupId) => {
    const { error } = await supabase.from('group_members').insert([{
      group_id: groupId,
      user_id: user.id,
    }]);
    if (!error) alert('Joined group successfully!');
  };

  const colors = ['#EEF2FF', '#F0FDF4', '#FFF7ED', '#FDF4FF', '#F0F9FF'];

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
            <Typography variant="h4" fontWeight={700} mb={0.5}>Study Groups</Typography>
            <Typography variant="body1" color="text.secondary">Join or create a group to start collaborating</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ py: 1.5, px: 3 }}>
            Create Group
          </Button>
        </Box>

        <Grid container spacing={3}>
          {groups.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
                <GroupsIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No study groups yet</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Create the first one and invite your classmates!</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Create Group</Button>
              </Paper>
            </Grid>
          )}
          {groups.map((group, index) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Paper sx={{
                p: 3, borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
              }}>
                <Box sx={{ backgroundColor: colors[index % colors.length], borderRadius: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <GroupsIcon sx={{ color: '#4F46E5' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>{group.name}</Typography>
                <Chip label={group.subject} size="small" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5' }} />
                <Typography variant="body2" color="text.secondary" mb={2}>{group.description}</Typography>
                <Button variant="outlined" size="small" fullWidth onClick={() => handleJoinGroup(group.id)}>
                  Join Group
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight={700}>Create Study Group</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} margin="normal" />
          <TextField fullWidth label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} margin="normal" />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGroup}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Groups;