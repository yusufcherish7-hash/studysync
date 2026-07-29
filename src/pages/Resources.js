import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, LinearProgress } from '@mui/material';
import { Add, FolderOpen, ArrowBack, Download, Upload } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Resources() {
  const [resources, setResources] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate('/');
      else {
        setUser(data.user);
        fetchResources();
        fetchGroups();
      }
    };
    getUser();
  }, [navigate]);

  const fetchResources = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (data) setResources(data);
  };

  const fetchGroups = async () => {
    const { data } = await supabase.from('study_groups').select('*');
    if (data) setGroups(data);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    return '📄';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('studysync').upload(filePath, file);

    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('studysync').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('resources').insert([{
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      group_id: selectedGroup || null,
      uploaded_by: user.id,
    }]);

    if (dbError) {
      alert('Database error: ' + dbError.message);
    } else {
      setOpen(false);
      setFile(null);
      setSelectedGroup('');
      fetchResources();
    }
    setUploading(false);
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
            <Typography variant="h4" fontWeight={700} mb={0.5}>Resources</Typography>
            <Typography variant="body1" color="text.secondary">Upload and share learning materials</Typography>
          </Box>
          <Button variant="contained" startIcon={<Upload />} onClick={() => setOpen(true)} sx={{ py: 1.5, px: 3 }}>
            Upload Resource
          </Button>
        </Box>

        <Grid container spacing={3}>
          {resources.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
                <FolderOpen sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No resources yet</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Upload your first learning material!</Typography>
                <Button variant="contained" startIcon={<Upload />} onClick={() => setOpen(true)}>Upload Resource</Button>
              </Paper>
            </Grid>
          )}
          {resources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Paper sx={{
                p: 3, borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
              }}>
                <Typography sx={{ fontSize: 40, mb: 1 }}>{getFileIcon(resource.file_type)}</Typography>
                <Typography variant="h6" fontWeight={600} noWrap mb={0.5}>{resource.file_name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{resource.file_type}</Typography>
                <Button variant="outlined" size="small" fullWidth startIcon={<Download />} href={resource.file_url} target="_blank">
                  Download
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight={700}>Upload Resource</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Study Group (optional)" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} margin="normal">
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2, py: 2, borderStyle: 'dashed' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Upload sx={{ fontSize: 32, color: '#4F46E5', mb: 1 }} />
              <Typography variant="body1" fontWeight={600}>{file ? file.name : 'Click to choose a file'}</Typography>
              <Typography variant="body2" color="text.secondary">Any file type supported</Typography>
            </Box>
            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
          </Button>
          {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Resources;