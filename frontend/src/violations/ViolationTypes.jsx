import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function ViolationTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/violations/types/', { params: { search } });
        const list = Array.isArray(data) ? data : data.results || [];
        setTypes(list);
      } catch { setTypes([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Violation Types</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Add Type
        </Button>
      </Box>

      <TextField placeholder="Search types..." size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : types.length === 0 ? (
          <EmptyState icon={CategoryIcon} title="No violation types" description="Define violation categories for your community." actionLabel="Add Type" onAction={() => {}} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Default Fine</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cure Period (days)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description || '--'}
                    </TableCell>
                    <TableCell>{t.default_fine ? `$${t.default_fine.toFixed(2)}` : '--'}</TableCell>
                    <TableCell>{t.cure_period_days ?? '--'}</TableCell>
                    <TableCell>
                      <Chip label={t.severity || 'minor'} size="small"
                        color={t.severity === 'major' ? 'error' : t.severity === 'moderate' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={t.is_active !== false ? 'Active' : 'Inactive'} size="small"
                        color={t.is_active !== false ? 'success' : 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
