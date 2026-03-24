import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, TextField, InputAdornment,
  TablePagination, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { search, page: page + 1, page_size: rowsPerPage };
        if (actionFilter !== 'all') params.action = actionFilter;
        const { data } = await api.get('/admin/audit-log/', { params });
        const list = Array.isArray(data) ? data : data.results || [];
        setLogs(list);
        setTotal(data.count ?? list.length);
      } catch { setLogs([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [search, actionFilter, page, rowsPerPage]);

  const actionColor = (a) => {
    const map = { create: 'success', update: 'info', delete: 'error', login: 'default', logout: 'default' };
    return map[a] || 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Audit Log</Typography>
        <Typography sx={{ color: 'text.secondary' }}>Track all actions and changes within the community</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search by user, action, or resource..." size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 300 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Action</InputLabel>
          <Select value={actionFilter} label="Action" onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="create">Create</MenuItem>
            <MenuItem value="update">Update</MenuItem>
            <MenuItem value="delete">Delete</MenuItem>
            <MenuItem value="login">Login</MenuItem>
            <MenuItem value="logout">Logout</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : logs.length === 0 ? (
          <EmptyState icon={HistoryIcon} title="No audit entries" description="System activity will be logged here." />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit',
                        }) : '--'}
                      </TableCell>
                      <TableCell>{log.user_name || log.user_email || 'System'}</TableCell>
                      <TableCell>
                        <Chip label={log.action || '--'} size="small" color={actionColor(log.action)} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={log.resource_type || '--'} size="small" variant="outlined" />
                        {log.resource_id && <Typography component="span" sx={{ ml: 0.5, fontSize: '0.8rem', color: 'text.secondary' }}>#{log.resource_id}</Typography>}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {log.details || log.description || '--'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip_address || '--'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]} />
          </>
        )}
      </Card>
    </Box>
  );
}
