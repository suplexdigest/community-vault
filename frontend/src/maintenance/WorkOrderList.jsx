import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function WorkOrderList() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchData();
  }, [search, statusFilter, page, rowsPerPage]);

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
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
          <EmptyState icon={BuildIcon} title="No work orders" description="Submit a work order to request maintenance." actionLabel="Submit Work Order" onAction={() => {}} />
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
    </Box>
  );
}
