import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        p: 3,
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.5px' }}>
            StudySync
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Your collaborative learning platform
          </Typography>
        </Box>

        <Paper sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Welcome back!</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Sign in to continue to StudySync</Typography>

          {error && (
            <Box sx={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, p: 1.5, mb: 2 }}>
              <Typography color="error" variant="body2">{error}</Typography>
            </Box>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth label="Email address" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              margin="normal" required
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              margin="normal" required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth variant="contained" type="submit"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              Sign in
            </Button>
          </form>

          <Typography textAlign="center" variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link href="/register" underline="hover" fontWeight={600}>Create one</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;