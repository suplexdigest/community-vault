import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  owner: '', assessment: '', amount: '', payment_method: 'check',
  check_number: '', payment_date: '', notes: '',
};

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
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
  const [owners, setOwners] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/', {
        params: { search, page: page + 1, page_size: rowsPerPage },
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setPayments(list);
      setTotal(data.count ?? list.length);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setAssessments([]);
    setOpen(true);
    try {
      const ownerRes = await api.get('/owners/', { params: { page_size: 999 } }).catch(() => ({ data: [] }));
      setOwners(Array.isArray(ownerRes.data) ? ownerRes.data : ownerRes.data.results || []);
    } catch { /* empty */ }
  };

  const handleOwnerChange = async (ownerId) => {
    setForm({ ...form, owner: ownerId, assessment: '' });
    try {
      const { data } = await api.get('/assessments/', { params: { owner: ownerId, status: 'pending', page_size: 999 } });
      setAssessments(Array.isArray(data) ? data : data.results || []);
    } catch { setAssessments([]); }
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
      await api.post('/finances/payments/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to record payment.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Payments
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Record Payment
        </Button>
      </Box>

      <TextField
        placeholder="Search by owner, property, or reference..."
        size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> },
        }}
      />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : payments.length === 0 ? (
          <EmptyState icon={PaymentIcon} title="No payments found" description="Record payments as they come in." actionLabel="Record Payment" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{p.owner_name || p.owner?.name || '--'}</TableCell>
                      <TableCell>{p.property_address || '--'}</TableCell>
                      <TableCell>
                        <Chip label={p.payment_method || 'Check'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.reference_number || '--'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>${(p.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={p.status || 'cleared'} size="small" color={p.status === 'void' ? 'error' : 'success'} />
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

      {/* Record Payment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>Record Payment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Owner *</InputLabel>
            <Select value={form.owner} label="Owner *" onChange={(e) => handleOwnerChange(e.target.value)}>
              {owners.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.name || `${o.first_name} ${o.last_name}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Assessment</InputLabel>
            <Select value={form.assessment} label="Assessment" onChange={(e) => setForm({ ...form, assessment: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {assessments.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.description || a.assessment_type || 'Assessment'} - ${(a.amount || 0).toFixed(2)} (due {a.due_date || 'N/A'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Amount *" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select value={form.payment_method} label="Payment Method" onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="ach">ACH</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </Select>
          </FormControl>
          {form.payment_method === 'check' && (
            <TextField label="Check Number" fullWidth value={form.check_number}
              onChange={(e) => setForm({ ...form, check_number: e.target.value })} />
          )}
          <TextField label="Payment Date" type="date" fullWidth value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Notes" multiline rows={2} fullWidth value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Payment recorded successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
