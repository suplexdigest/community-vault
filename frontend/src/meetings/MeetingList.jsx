import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
  Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  title: '', meeting_type: 'board', date: '', time: '',
  location: '', is_virtual: false, virtual_link: '',
};

export default function MeetingList() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/meetings/', { params: { search, page: page + 1, page_size: rowsPerPage } });
      const list = Array.isArray(data) ? data : data.results || [];
      setMeetings(list);
      setTotal(data.count ?? list.length);
    } catch { setMeetings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, page, rowsPerPage]);

  const handleOpen = () => { setForm(INITIAL_FORM); setError(''); setOpen(true); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) payload[k] = v;
      });
      // Combine date and time into a single datetime if both present
      if (payload.date && payload.time) {
        payload.date = `${payload.date}T${payload.time}`;
        delete payload.time;
      }
      await api.post('/meetings/meetings/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create meeting.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Meetings</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Schedule Meeting
        </Button>
      </Box>

      <TextField placeholder="Search meetings..." size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : meetings.length === 0 ? (
          <EmptyState icon={EventIcon} title="No meetings found" description="Schedule your first board meeting." actionLabel="Schedule Meeting" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quorum</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meetings.map((m) => (
                    <TableRow key={m.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/meetings/${m.id}`)}>
                      <TableCell>
                        {m.date ? new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '--'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{m.title || m.name}</TableCell>
                      <TableCell><Chip label={m.meeting_type || m.type || 'Board'} size="small" variant="outlined" /></TableCell>
                      <TableCell>{m.location || '--'}</TableCell>
                      <TableCell>
                        <Chip label={m.quorum_met ? 'Met' : 'Not Met'} size="small"
                          color={m.quorum_met ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={m.status || 'scheduled'} size="small"
                          color={m.status === 'completed' ? 'success' : m.status === 'cancelled' ? 'error' : 'info'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </>
        )}
      </Card>

      {/* Schedule Meeting Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Meeting Type</InputLabel>
            <Select value={form.meeting_type} label="Meeting Type" onChange={(e) => setForm({ ...form, meeting_type: e.target.value })}>
              <MenuItem value="board">Board</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
              <MenuItem value="special">Special</MenuItem>
              <MenuItem value="committee">Committee</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Date" type="date" fullWidth value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Time" type="time" fullWidth value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Location" fullWidth value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <FormControlLabel
            control={<Switch checked={form.is_virtual} onChange={(e) => setForm({ ...form, is_virtual: e.target.checked })} />}
            label="Virtual Meeting"
          />
          {form.is_virtual && (
            <TextField label="Virtual Meeting Link" fullWidth value={form.virtual_link}
              onChange={(e) => setForm({ ...form, virtual_link: e.target.value })}
              placeholder="https://zoom.us/j/..." />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Meeting scheduled successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
