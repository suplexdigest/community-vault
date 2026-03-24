import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchData();
  }, [search, page, rowsPerPage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Expenses
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
          <EmptyState icon={MoneyOffIcon} title="No expenses found" description="Log expenses to track community spending." actionLabel="Log Expense" onAction={() => {}} />
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
    </Box>
  );
}
