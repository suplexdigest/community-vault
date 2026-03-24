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
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  unit_number: '', address: '', property_type: 'single_family', square_footage: '',
  bedrooms: '', bathrooms: '', year_built: '', parking_spots: '', has_garage: false, notes: '',
};

export default function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
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
      const { data } = await api.get('/properties/', {
        params: { search, page: page + 1, page_size: rowsPerPage },
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setProperties(list);
      setTotal(data.count ?? list.length);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
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
      ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'parking_spots'].forEach((f) => {
        if (payload[f]) payload[f] = Number(payload[f]);
      });
      await api.post('/properties/properties/', payload);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to create property.');
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Properties
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Add Property
        </Button>
      </Box>

      <TextField
        placeholder="Search by address, lot, or unit..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          },
        }}
      />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : properties.length === 0 ? (
          <EmptyState icon={HomeWorkIcon} title="No properties found" description="Add your first property to get started." actionLabel="Add Property" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Unit/Lot</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((p) => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/app/properties/${p.id}`)}
                    >
                      <TableCell>{p.address || p.street_address}</TableCell>
                      <TableCell>{p.unit_number || p.lot_number || '--'}</TableCell>
                      <TableCell>
                        <Chip label={p.property_type || 'Residential'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{p.owner_name || p.owner?.name || '--'}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.status || 'Active'}
                          size="small"
                          color={p.status === 'vacant' ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: (p.balance || 0) > 0 ? 'error.main' : 'success.main' }}>
                        ${(p.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Card>

      {/* New Property Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>New Property</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Unit / Lot Number" fullWidth value={form.unit_number}
            onChange={(e) => setForm({ ...form, unit_number: e.target.value })} />
          <TextField label="Address *" fullWidth value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select value={form.property_type} label="Property Type" onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
              <MenuItem value="single_family">Single Family</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="lot">Lot</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Square Footage" type="number" fullWidth value={form.square_footage}
            onChange={(e) => setForm({ ...form, square_footage: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Bedrooms" type="number" fullWidth value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            <TextField label="Bathrooms" type="number" fullWidth value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Year Built" type="number" fullWidth value={form.year_built}
              onChange={(e) => setForm({ ...form, year_built: e.target.value })} />
            <TextField label="Parking Spots" type="number" fullWidth value={form.parking_spots}
              onChange={(e) => setForm({ ...form, parking_spots: e.target.value })} />
          </Box>
          <FormControlLabel
            control={<Switch checked={form.has_garage} onChange={(e) => setForm({ ...form, has_garage: e.target.checked })} />}
            label="Has Garage"
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
        <Alert severity="success" onClose={() => setSuccess(false)}>Property added successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
