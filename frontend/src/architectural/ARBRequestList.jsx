import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  property: '', title: '', description: '', project_type: 'other',
  estimated_cost: '', estimated_start_date: '', estimated_completion_date: '',
  plans_file: null, photo: null,
};

export default function ARBRequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
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
  const [properties, setProperties] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/architectural-requests/', { params: { search, page: page + 1, page_size: rowsPerPage } });
      const list = Array.isArray(data) ? data : data.results || [];
      setRequests(list);
      setTotal(data.count ?? list.length);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const propRes = await api.get('/properties/', { params: { page_size: 999 } });
      setProperties(Array.isArray(propRes.data) ? propRes.data : propRes.data.results || []);
    } catch { /* empty */ }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      await api.post('/architectural/requests/', fd);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to submit request.');
    } finally { setSubmitting(false); }
  };

  const statusColor = (s) => {
    const map = { submitted: 'info', under_review: 'warning', approved: 'success', approved_with_conditions: 'success', denied: 'error' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Architectural Requests</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Submit Request
        </Button>
      </Box>

      <TextField placeholder="Search requests..." size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : requests.length === 0 ? (
          <EmptyState icon={ArchitectureIcon} title="No ARB requests" description="Submit an architectural review request for home improvements." actionLabel="Submit Request" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Est. Cost</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/architectural/${r.id}`)}>
                      <TableCell>{r.submitted_date ? new Date(r.submitted_date).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{r.property_address || '--'}</TableCell>
                      <TableCell>{r.owner_name || '--'}</TableCell>
                      <TableCell><Chip label={r.project_type || 'Modification'} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description || '--'}
                      </TableCell>
                      <TableCell>{r.estimated_cost ? `$${Number(r.estimated_cost).toLocaleString()}` : '--'}</TableCell>
                      <TableCell><Chip label={(r.status || 'submitted').replace('_', ' ')} size="small" color={statusColor(r.status)} /></TableCell>
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

      {/* New ARB Request Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Architectural Request</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Property *</InputLabel>
            <Select value={form.property} label="Property *" onChange={(e) => setForm({ ...form, property: e.target.value })}>
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.address || p.unit_number || `Property #${p.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField label="Description" multiline rows={3} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Project Type</InputLabel>
            <Select value={form.project_type} label="Project Type" onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
              <MenuItem value="exterior_paint">Exterior Paint</MenuItem>
              <MenuItem value="fence">Fence</MenuItem>
              <MenuItem value="landscaping">Landscaping</MenuItem>
              <MenuItem value="structure">Structure</MenuItem>
              <MenuItem value="roof">Roof</MenuItem>
              <MenuItem value="solar">Solar</MenuItem>
              <MenuItem value="window">Window</MenuItem>
              <MenuItem value="door">Door</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Estimated Cost" type="number" fullWidth value={form.estimated_cost}
            onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
          <TextField label="Estimated Start Date" type="date" fullWidth value={form.estimated_start_date}
            onChange={(e) => setForm({ ...form, estimated_start_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Estimated Completion Date" type="date" fullWidth value={form.estimated_completion_date}
            onChange={(e) => setForm({ ...form, estimated_completion_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <Button variant="outlined" component="label">
            {form.plans_file ? form.plans_file.name : 'Upload Plans (optional)'}
            <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setForm({ ...form, plans_file: e.target.files[0] || null })} />
          </Button>
          <Button variant="outlined" component="label">
            {form.photo ? form.photo.name : 'Upload Photo (optional)'}
            <input type="file" hidden accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files[0] || null })} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>ARB request submitted successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
