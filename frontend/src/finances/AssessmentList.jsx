import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
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
    fetchData();
  }, [search, statusFilter, page, rowsPerPage]);

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
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
          <EmptyState icon={ReceiptIcon} title="No assessments found" description="Create your first assessment to bill property owners." actionLabel="Create Assessment" onAction={() => {}} />
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
    </Box>
  );
}
