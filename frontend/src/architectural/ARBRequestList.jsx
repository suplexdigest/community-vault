import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function ARBRequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchData();
  }, [search, page, rowsPerPage]);

  const statusColor = (s) => {
    const map = { submitted: 'info', under_review: 'warning', approved: 'success', approved_with_conditions: 'success', denied: 'error' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Architectural Requests</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
          <EmptyState icon={ArchitectureIcon} title="No ARB requests" description="Submit an architectural review request for home improvements." actionLabel="Submit Request" onAction={() => {}} />
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
    </Box>
  );
}
