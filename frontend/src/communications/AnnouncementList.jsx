import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent, Grid,
  Chip, CircularProgress, InputAdornment, Divider, Avatar,
  MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../auth/AuthContext';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

const INITIAL_FORM = {
  title: '', content: '', priority: 'normal', target_audience: 'all', is_pinned: false,
};

export default function AnnouncementList() {
  const { hasMinRole } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements/', { params: { search } });
      const list = Array.isArray(data) ? data : data.results || [];
      setAnnouncements(list);
    } catch { setAnnouncements([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleOpen = () => { setForm(INITIAL_FORM); setError(''); setOpen(true); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) payload[k] = v;
      });
      await api.post('/communications/announcements/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create announcement.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Announcements</Typography>
        {hasMinRole('board_member') && (
          <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
            New Announcement
          </Button>
        )}
      </Box>

      <TextField placeholder="Search announcements..." size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : announcements.length === 0 ? (
        <Card>
          <EmptyState icon={CampaignIcon} title="No announcements" description="Community announcements will appear here." />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((a) => (
            <Grid size={{ xs: 12, md: 6 }} key={a.id}>
              <Card sx={{
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                borderLeft: a.priority === 'urgent' ? '4px solid #c62828' : a.priority === 'important' ? `4px solid ${GOLD}` : 'none',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1.05rem' }}>
                      {a.title}
                    </Typography>
                    {a.priority && a.priority !== 'normal' && (
                      <Chip label={a.priority} size="small"
                        color={a.priority === 'urgent' ? 'error' : 'warning'} />
                    )}
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.content || a.body || a.message}
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: GREEN }}>
                        {(a.author_name || a.author || 'A')[0]}
                      </Avatar>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {a.author_name || a.author || 'Board'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Announcement Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Announcement</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField label="Content *" multiline rows={5} fullWidth value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="important">Important</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Target Audience</InputLabel>
            <Select value={form.target_audience} label="Target Audience" onChange={(e) => setForm({ ...form, target_audience: e.target.value })}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="owners">Owners</MenuItem>
              <MenuItem value="residents">Residents</MenuItem>
              <MenuItem value="board">Board Members</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />}
            label="Pin Announcement"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Announcement posted successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
