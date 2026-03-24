import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const CATEGORIES = [
  { value: 'property_maintenance', label: 'Property Maintenance' },
  { value: 'parking', label: 'Parking' },
  { value: 'noise', label: 'Noise' },
  { value: 'pets', label: 'Pets' },
  { value: 'architectural', label: 'Architectural' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'trash', label: 'Trash' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM = { name: '', description: '', category: '', default_fine: '', cure_period_days: '' };

export default function ViolationTypes() {
  const [types, setTypes] = useState([]);
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
      const { data } = await api.get('/violations/types/', { params: { search } });
      const list = Array.isArray(data) ? data : data.results || [];
      setTypes(list);
    } catch { setTypes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleOpen = () => { setForm(INITIAL_FORM); setError(''); setOpen(true); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.default_fine) payload.default_fine = parseFloat(payload.default_fine);
      if (payload.cure_period_days) payload.cure_period_days = parseInt(payload.cure_period_days, 10);
      await api.post('/violations/violation-types/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create violation type.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Violation Types</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Add Type
        </Button>
      </Box>

      <TextField placeholder="Search types..." size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : types.length === 0 ? (
          <EmptyState icon={CategoryIcon} title="No violation types" description="Define violation categories for your community." actionLabel="Add Type" onAction={handleOpen} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Default Fine</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cure Period (days)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description || '--'}
                    </TableCell>
                    <TableCell>{t.default_fine ? `$${t.default_fine.toFixed(2)}` : '--'}</TableCell>
                    <TableCell>{t.cure_period_days ?? '--'}</TableCell>
                    <TableCell>
                      <Chip label={t.severity || 'minor'} size="small"
                        color={t.severity === 'major' ? 'error' : t.severity === 'moderate' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={t.is_active !== false ? 'Active' : 'Inactive'} size="small"
                        color={t.is_active !== false ? 'success' : 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* New Violation Type Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Violation Type</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name *" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Description" multiline rows={2} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Default Fine ($)" type="number" fullWidth value={form.default_fine}
            onChange={(e) => setForm({ ...form, default_fine: e.target.value })} />
          <TextField label="Cure Period (days)" type="number" fullWidth value={form.cure_period_days}
            onChange={(e) => setForm({ ...form, cure_period_days: e.target.value })} />
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
        <Alert severity="success" onClose={() => setSuccess(false)}>Violation type created successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
