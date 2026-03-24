import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, IconButton, MenuItem, Select,
  FormControl, InputLabel, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

const INITIAL_FORM = {
  title: '', category: '', document_type: 'other', file: null, description: '', is_public: false,
};

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
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
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents/', { params: { search, page: page + 1, page_size: rowsPerPage } });
      const list = Array.isArray(data) ? data : data.results || [];
      setDocuments(list);
      setTotal(data.count ?? list.length);
    } catch { setDocuments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, page, rowsPerPage]);

  const handleOpen = async () => {
    setForm(INITIAL_FORM);
    setError('');
    setOpen(true);
    try {
      const catRes = await api.get('/documents/categories/', { params: { page_size: 999 } }).catch(() => ({ data: [] }));
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
    } catch { /* empty */ }
  };

  const handleSubmit = async () => {
    if (!form.file) { setError('Please select a file to upload.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', form.file);
      if (form.title) fd.append('title', form.title);
      if (form.category) fd.append('category', form.category);
      if (form.document_type) fd.append('document_type', form.document_type);
      if (form.description) fd.append('description', form.description);
      fd.append('is_public', form.is_public);
      await api.post('/documents/documents/', fd);
      setOpen(false);
      setSuccess(true);
      fetchData();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to upload document.');
    } finally { setSubmitting(false); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '--';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Documents</Typography>
        <Button variant="contained" startIcon={<UploadFileIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }} onClick={handleOpen}>
          Upload Document
        </Button>
      </Box>

      <TextField placeholder="Search documents..." size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : documents.length === 0 ? (
          <EmptyState icon={DescriptionIcon} title="No documents found" description="Upload CC&Rs, bylaws, meeting minutes, and other community documents." actionLabel="Upload Document" onAction={handleOpen} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((d) => (
                    <TableRow key={d.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 600 }}>{d.name || d.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={d.category || 'General'} size="small" variant="outlined" /></TableCell>
                      <TableCell>{d.uploaded_by_name || d.uploaded_by || '--'}</TableCell>
                      <TableCell>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{formatSize(d.file_size)}</TableCell>
                      <TableCell>
                        <IconButton size="small" title="View"><VisibilityIcon sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" title="Download"><DownloadIcon sx={{ fontSize: 18 }} /></IconButton>
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

      {/* Upload Document Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: GREEN }}>Upload Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" fullWidth value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {categories.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <MenuItem key={c.id || c.name} value={c.id || c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          ) : (
            <TextField label="Category" fullWidth value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
          )}
          <FormControl fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select value={form.document_type} label="Document Type" onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
              <MenuItem value="ccr">CC&Rs</MenuItem>
              <MenuItem value="bylaws">Bylaws</MenuItem>
              <MenuItem value="rules">Rules & Regulations</MenuItem>
              <MenuItem value="form">Form</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="minutes">Meeting Minutes</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" component="label" color={form.file ? 'success' : 'primary'}>
            {form.file ? form.file.name : 'Select File *'}
            <input type="file" hidden onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })} />
          </Button>
          <TextField label="Description" multiline rows={2} fullWidth value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormControlLabel
            control={<Switch checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />}
            label="Publicly Visible"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Document uploaded successfully.</Alert>
      </Snackbar>
    </Box>
  );
}
