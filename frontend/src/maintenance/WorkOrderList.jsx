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
import BuildIcon from '@mui/icons-material/Build';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  title: '', description: '', property: '', category: '', priority: 'medium', photo: null,
};

export default function WorkOrderList() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search, page: page + 1, page_size: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/work-orders/', { params });
      const list = Array.isArray(data) ? data : data.results || [];
      setWorkOrders(list);
      setTotal(data.count ?? list.length);
    } catch { setWorkOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const [propRes, catRes] = await Promise.all([
        api.get('/properties/', { params: { page_size: 999 } }),
        api.get('/maintenance/categories/', { params: { page_size: 999 } }).catch(() => ({ data: [] })),
      ]);
      setProperties(Array.isArray(propRes.data) ? propRes.data : propRes.data.results || []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
    } catch { /* selects may be empty */ }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') payload.append(k, v);
      });
      await api.post('/maintenance/work-orders/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create work order.');
    } finally { setSubmitting(false); }
  };

  const priorityColor = (p) => {
    const map = { urgent: 'error', high: 'error', medium: 'warning', low: 'default' };
    return map[p] || 'default';
  };

  const statusColor = (s) => {
    const map = { open: 'info', in_progress: 'warning', completed: 'success', cancelled: 'default' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Work Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Submit Work Order
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search work orders..." size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 300 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : workOrders.length === 0 ? (
          <EmptyState icon={BuildIcon} title="No work orders" description="Submit a work order to request maintenance." actionLabel="Submit Work Order" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/maintenance/${wo.id}`)}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>#{wo.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{wo.title}</TableCell>
                      <TableCell>{wo.location || wo.property_address || '--'}</TableCell>
                      <TableCell><Chip label={wo.category || 'General'} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={wo.priority || 'medium'} size="small" color={priorityColor(wo.priority)} /></TableCell>
                      <TableCell>{wo.assigned_to_name || wo.assigned_to || 'Unassigned'}</TableCell>
                      <TableCell><Chip label={(wo.status || 'open').replace('_', ' ')} size="small" color={statusColor(wo.status)} /></TableCell>
                      <TableCell>{wo.created_at ? new Date(wo.created_at).toLocaleDateString() : '--'}</TableCell>
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

      {/* New Work Order Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Work Order</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField label="Description" multiline rows={3} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Property (optional)</InputLabel>
            <Select value={form.property} label="Property (optional)" onChange={(e) => setForm({ ...form, property: e.target.value })}>
              <MenuItem value="">Common Area</MenuItem>
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.address || p.unit_number || `Property #${p.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {categories.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <MenuItem key={c.id || c.name} value={c.id || c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          {categories.length === 0 && (
            <TextField label="Category" fullWidth value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
          )}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </Select>
          </FormControl>
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
        <Alert severity="success" onClose={() => setSuccess(false)}>Work order created successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
