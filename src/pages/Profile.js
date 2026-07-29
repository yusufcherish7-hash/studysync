import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Avatar, Divider } from '@mui/material';
import { ArrowBack, Person, Save } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate('/');
      else {
        setUser(data.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          setFullName(profile.full_name || '');
          setStudentId(profile.student_id || '');
        }
      }
    };
    getUser();
  }, [navigate]);

  const handleUpdate = async () => {
    const { error } = await supabase.from('profiles').upsert([{
      id: user.id,
      full_name: fullName,
      student_id: studentId,
      email: user.email,
    }]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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

      <Box sx={{ px: 4, py: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>My Profile</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>Manage your account information</Typography>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            p: 4, display: 'flex', alignItems: 'center', gap: 3
          }}>
            <Avatar sx={{ width: 80, height: 80, fontSize: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                {fullName || 'Your Name'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            {error && (
              <Box sx={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, p: 1.5, mb: 2 }}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Box>
            )}
            {success && (
              <Box sx={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2, p: 1.5, mb: 2 }}>
                <Typography color="success.main" variant="body2">{success}</Typography>
              </Box>
            )}

            <TextField fullWidth label="Email address" value={user?.email || ''} margin="normal" disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#64748B' } }} />
            <TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} margin="normal" />
            <TextField fullWidth label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} margin="normal" />

            <Button fullWidth variant="contained" startIcon={<Save />} onClick={handleUpdate} sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}>
              Save Changes
            </Button>

            <Divider sx={{ my: 2 }} />

            <Button fullWidth variant="outlined" color="error" onClick={handleLogout} sx={{ py: 1.5 }}>
              Sign Out
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default Profile;