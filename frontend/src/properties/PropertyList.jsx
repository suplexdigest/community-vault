import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchData();
  }, [search, page, rowsPerPage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Properties
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
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
          <EmptyState icon={HomeWorkIcon} title="No properties found" description="Add your first property to get started." actionLabel="Add Property" onAction={() => {}} />
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
    </Box>
  );
}
