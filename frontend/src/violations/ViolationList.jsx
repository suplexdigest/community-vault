import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function ViolationList() {
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
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
        const { data } = await api.get('/violations/', { params });
        const list = Array.isArray(data) ? data : data.results || [];
        setViolations(list);
        setTotal(data.count ?? list.length);
      } catch { setViolations([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [search, statusFilter, page, rowsPerPage]);

  const statusColor = (s) => {
    const map = { open: 'error', pending: 'warning', resolved: 'success', appealed: 'info', closed: 'default' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Violations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
    </Box>
  );
}
