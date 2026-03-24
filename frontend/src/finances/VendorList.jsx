import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  name: '', contact_name: '', email: '', phone: '', address: '',
  specialty: '', license_number: '', insurance_expiry: '', w9_on_file: false, notes: '',
};

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
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
      const { data } = await api.get('/vendors/', { params: { search, page: page + 1, page_size: rowsPerPage } });
      const list = Array.isArray(data) ? data : data.results || [];
      setVendors(list);
      setTotal(data.count ?? list.length);
    } catch { setVendors([]); }
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
      await api.post('/finances/vendors/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create vendor.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Vendors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>Add Vendor</Button>
      </Box>

      <TextField placeholder="Search vendors..." size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : vendors.length === 0 ? (
          <EmptyState icon={StorefrontIcon} title="No vendors found" description="Add vendors to track community service providers." actionLabel="Add Vendor" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Paid</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{v.company_name || v.name}</TableCell>
                      <TableCell>{v.contact_name || '--'}</TableCell>
                      <TableCell>{v.phone || '--'}</TableCell>
                      <TableCell>{v.email || '--'}</TableCell>
                      <TableCell><Chip label={v.category || 'General'} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={v.status || 'Active'} size="small" color={v.status === 'inactive' ? 'default' : 'success'} /></TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>${(v.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
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

      {/* New Vendor Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Vendor</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Company Name *" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Contact Name" fullWidth value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          <TextField label="Email" type="email" fullWidth value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" fullWidth value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Address" fullWidth value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <TextField label="Specialty" fullWidth value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          <TextField label="License Number" fullWidth value={form.license_number}
            onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          <TextField label="Insurance Expiry" type="date" fullWidth value={form.insurance_expiry}
            onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <FormControlLabel
            control={<Switch checked={form.w9_on_file} onChange={(e) => setForm({ ...form, w9_on_file: e.target.checked })} />}
            label="W-9 On File"
          />
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
        <Alert severity="success" onClose={() => setSuccess(false)}>Vendor added successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
