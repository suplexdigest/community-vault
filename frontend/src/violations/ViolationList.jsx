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
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  property: '', violation_type: '', description: '', date_observed: '', priority: 'medium', photo: null,
};

export default function ViolationList() {
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
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
  const [violationTypes, setViolationTypes] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search, page: page + 1, page_size: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/violations/', { params });
      const list = Array.isArray(data) ? data : data.results || [];
      setViolations(list);
      setTotal(data.count ?? list.length);
    } catch { setViolations([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const [propRes, typeRes] = await Promise.all([
        api.get('/properties/', { params: { page_size: 999 } }),
        api.get('/violations/types/', { params: { page_size: 999 } }),
      ]);
      setProperties(Array.isArray(propRes.data) ? propRes.data : propRes.data.results || []);
      setViolationTypes(Array.isArray(typeRes.data) ? typeRes.data : typeRes.data.results || []);
    } catch { /* selects will be empty */ }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') payload.append(k, v);
      });
      await api.post('/violations/violations/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create violation.');
    } finally { setSubmitting(false); }
  };

  const statusColor = (s) => {
    const map = { open: 'error', pending: 'warning', resolved: 'success', appealed: 'info', closed: 'default' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Violations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Create Violation
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search by address or type..." size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 300 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="appealed">Appealed</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : violations.length === 0 ? (
          <EmptyState icon={ReportProblemIcon} title="No violations found" description="Violations will appear here once created." />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fine</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cure By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {violations.map((v) => (
                    <TableRow key={v.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/violations/${v.id}`)}>
                      <TableCell>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{v.property_address || v.property?.address || '--'}</TableCell>
                      <TableCell><Chip label={v.violation_type_name || v.type || '--'} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.description || '--'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{v.fine_amount ? `$${v.fine_amount.toFixed(2)}` : '--'}</TableCell>
                      <TableCell>{v.cure_date ? new Date(v.cure_date).toLocaleDateString() : '--'}</TableCell>
                      <TableCell><Chip label={v.status || 'open'} size="small" color={statusColor(v.status)} /></TableCell>
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

      {/* Create Violation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Violation</DialogTitle>
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
          <FormControl fullWidth>
            <InputLabel>Violation Type *</InputLabel>
            <Select value={form.violation_type} label="Violation Type *" onChange={(e) => setForm({ ...form, violation_type: e.target.value })}>
              {violationTypes.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Description" multiline rows={3} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField label="Date Observed" type="date" fullWidth value={form.date_observed}
            onChange={(e) => setForm({ ...form, date_observed: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
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
            {submitting ? <CircularProgress size={22} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Violation created successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
