import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  vendor: '', category: '', amount: '', description: '',
  expense_date: '', check_number: '', receipt: null, notes: '',
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
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
  const [vendors, setVendors] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses/', {
        params: { search, page: page + 1, page_size: rowsPerPage },
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setExpenses(list);
      setTotal(data.count ?? list.length);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const [vendorRes, catRes] = await Promise.all([
        api.get('/vendors/', { params: { page_size: 999 } }),
        api.get('/finances/budget-categories/', { params: { type: 'expense', page_size: 999 } }).catch(() => ({ data: [] })),
      ]);
      setVendors(Array.isArray(vendorRes.data) ? vendorRes.data : vendorRes.data.results || []);
      setBudgetCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
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
      await api.post('/finances/expenses/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create expense.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Expenses
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Log Expense
        </Button>
      </Box>

      <TextField
        placeholder="Search by vendor, category, or description..."
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
        ) : expenses.length === 0 ? (
          <EmptyState icon={MoneyOffIcon} title="No expenses found" description="Log expenses to track community spending." actionLabel="Log Expense" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.expense_date ? new Date(e.expense_date).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{e.vendor_name || e.vendor?.name || '--'}</TableCell>
                      <TableCell><Chip label={e.category || 'General'} size="small" variant="outlined" /></TableCell>
                      <TableCell>{e.description || '--'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>${(e.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={e.status || 'paid'} size="small" color={e.status === 'pending' ? 'warning' : 'success'} />
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

      {/* New Expense Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Expense</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Vendor</InputLabel>
            <Select value={form.vendor} label="Vendor" onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
              {vendors.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.company_name || v.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {budgetCategories.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {budgetCategories.map((c) => <MenuItem key={c.id || c.name} value={c.id || c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          ) : (
            <TextField label="Category" fullWidth value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
          )}
          <TextField label="Amount *" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
          <TextField label="Description" multiline rows={2} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField label="Expense Date" type="date" fullWidth value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Check Number" fullWidth value={form.check_number}
            onChange={(e) => setForm({ ...form, check_number: e.target.value })} />
          <Button variant="outlined" component="label">
            {form.receipt ? form.receipt.name : 'Upload Receipt (optional)'}
            <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setForm({ ...form, receipt: e.target.files[0] || null })} />
          </Button>
          <TextField label="Notes" multiline rows={2} fullWidth value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Expense logged successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
