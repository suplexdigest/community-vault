import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function ResidentList() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/residents/', {
          params: { search, page: page + 1, page_size: rowsPerPage },
        });
        const list = Array.isArray(data) ? data : data.results || [];
        setResidents(list);
        setTotal(data.count ?? list.length);
      } catch {
        setResidents([]);
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
          Residents
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Add Resident
        </Button>
      </Box>

      <TextField
        placeholder="Search by name, unit, or email..."
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
        ) : residents.length === 0 ? (
          <EmptyState icon={PersonIcon} title="No residents found" description="Add residents to your community directory." actionLabel="Add Resident" onAction={() => {}} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Move-in Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {residents.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: GREEN, width: 32, height: 32, fontSize: '0.8rem' }}>
                            {(r.first_name || r.name || 'R')[0]}
                          </Avatar>
                          {r.first_name ? `${r.first_name} ${r.last_name}` : r.name}
                        </Box>
                      </TableCell>
                      <TableCell>{r.property_address || r.unit || '--'}</TableCell>
                      <TableCell>{r.email || '--'}</TableCell>
                      <TableCell>{r.phone || '--'}</TableCell>
                      <TableCell>
                        <Chip label={r.resident_type || 'Owner'} size="small" variant="outlined"
                          color={r.resident_type === 'tenant' ? 'info' : 'default'} />
                      </TableCell>
                      <TableCell>{r.move_in_date ? new Date(r.move_in_date).toLocaleDateString() : '--'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
