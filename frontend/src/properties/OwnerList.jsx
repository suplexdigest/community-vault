import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function OwnerList() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/owners/', {
          params: { search, page: page + 1, page_size: rowsPerPage },
        });
        const list = Array.isArray(data) ? data : data.results || [];
        setOwners(list);
        setTotal(data.count ?? list.length);
      } catch {
        setOwners([]);
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
          Property Owners
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Add Owner
        </Button>
      </Box>

      <TextField
        placeholder="Search by name, email, or phone..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> },
        }}
      />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : owners.length === 0 ? (
          <EmptyState icon={PeopleIcon} title="No owners found" description="Add property owners to manage your community." actionLabel="Add Owner" onAction={() => {}} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Properties</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {owners.map((o) => (
                    <TableRow key={o.id} hover sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: GREEN, width: 32, height: 32, fontSize: '0.8rem' }}>
                            {(o.first_name || o.name || 'O')[0]}
                          </Avatar>
                          {o.first_name ? `${o.first_name} ${o.last_name}` : o.name}
                        </Box>
                      </TableCell>
                      <TableCell>{o.email || '--'}</TableCell>
                      <TableCell>{o.phone || '--'}</TableCell>
                      <TableCell>{o.property_count ?? o.properties?.length ?? '--'}</TableCell>
                      <TableCell>
                        <Chip label={o.status || 'Active'} size="small" color={o.status === 'inactive' ? 'default' : 'success'} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: (o.total_balance || 0) > 0 ? 'error.main' : 'success.main' }}>
                        ${(o.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
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
