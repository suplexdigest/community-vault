import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  property: '', owner: '', amount: '', assessment_type: 'regular',
  period_start: '', period_end: '', due_date: '', notes: '',
};

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
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
  const [owners, setOwners] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search, page: page + 1, page_size: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/assessments/', { params });
      const list = Array.isArray(data) ? data : data.results || [];
      setAssessments(list);
      setTotal(data.count ?? list.length);
    } catch {
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const [propRes, ownerRes] = await Promise.all([
        api.get('/properties/', { params: { page_size: 999 } }),
        api.get('/owners/', { params: { page_size: 999 } }).catch(() => ({ data: [] })),
      ]);
      const propList = Array.isArray(propRes.data) ? propRes.data : propRes.data.results || [];
      setProperties(propList);
      setOwners(Array.isArray(ownerRes.data) ? ownerRes.data : ownerRes.data.results || []);
    } catch { /* selects may be empty */ }
  };

  const handlePropertyChange = (propId) => {
    const prop = properties.find((p) => p.id === propId);
    setForm({
      ...form,
      property: propId,
      owner: prop?.owner_id || prop?.owner?.id || form.owner,
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') payload[k] = v;
      });
      if (payload.amount) payload.amount = parseFloat(payload.amount);
      await api.post('/finances/assessments/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create assessment.');
    } finally { setSubmitting(false); }
  };

  const statusColor = (s) => {
    const map = { paid: 'success', pending: 'warning', overdue: 'error', partial: 'info' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Assessments
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Create Assessment
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by property or owner..."
          size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 300 }}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : assessments.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title="No assessments found" description="Create your first assessment to bill property owners." actionLabel="Create Assessment" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assessments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.property_address || a.property?.address || '--'}</TableCell>
                      <TableCell>{a.owner_name || a.owner?.name || '--'}</TableCell>
                      <TableCell>{a.description || a.assessment_type || '--'}</TableCell>
                      <TableCell>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '--'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>${(a.amount || 0).toFixed(2)}</TableCell>
                      <TableCell sx={{ color: 'success.main' }}>${(a.amount_paid || 0).toFixed(2)}</TableCell>
                      <TableCell><Chip label={a.status || 'pending'} size="small" color={statusColor(a.status)} /></TableCell>
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

      {/* New Assessment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Assessment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Property *</InputLabel>
            <Select value={form.property} label="Property *" onChange={(e) => handlePropertyChange(e.target.value)}>
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.address || p.unit_number || `Property #${p.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Owner</InputLabel>
            <Select value={form.owner} label="Owner" onChange={(e) => setForm({ ...form, owner: e.target.value })}>
              {owners.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.name || `${o.first_name} ${o.last_name}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Amount *" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
          <FormControl fullWidth>
            <InputLabel>Assessment Type</InputLabel>
            <Select value={form.assessment_type} label="Assessment Type" onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}>
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="special">Special</MenuItem>
              <MenuItem value="late_fee">Late Fee</MenuItem>
              <MenuItem value="fine">Fine</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Period Start" type="date" fullWidth value={form.period_start}
            onChange={(e) => setForm({ ...form, period_start: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Period End" type="date" fullWidth value={form.period_end}
            onChange={(e) => setForm({ ...form, period_end: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Due Date" type="date" fullWidth value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Notes" multiline rows={2} fullWidth value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
        <Alert severity="success" onClose={() => setSuccess(false)}>Assessment created successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
