import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  InputAdornment, TablePagination, Avatar, IconButton, MenuItem,
  Select, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';
import { useSnackbar } from '../components/common/SnackbarProvider';

const GREEN = '#1B4332';

const ROLES = ['resident', 'board_member', 'treasurer', 'secretary', 'president', 'manager', 'admin'];

export default function UserManagement() {
  const { success, error: showError } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, page, rowsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users/', { params: { search, page: page + 1, page_size: rowsPerPage } });
      const list = Array.isArray(data) ? data : data.results || [];
      setUsers(list);
      setTotal(data.count ?? list.length);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async () => {
    if (!editUser) return;
    try {
      await api.patch(`/admin/users/${editUser.id}/`, { role: editRole });
      success(`Role updated to ${editRole.replace('_', ' ')}`);
      setEditUser(null);
      fetchUsers();
    } catch {
      showError('Failed to update role.');
    }
  };

  const roleColor = (r) => {
    const map = { admin: 'error', manager: 'warning', president: 'secondary', treasurer: 'info', secretary: 'info', board_member: 'primary', resident: 'default' };
    return map[r] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Invite User
        </Button>
      </Box>

      <TextField placeholder="Search users..." size="small" fullWidth value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : users.length === 0 ? (
          <EmptyState icon={AdminPanelSettingsIcon} title="No users found" description="Invite users to join your community." actionLabel="Invite User" onAction={() => {}} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: GREEN, width: 32, height: 32, fontSize: '0.8rem' }}>
                            {(u.first_name || u.email || 'U')[0].toUpperCase()}
                          </Avatar>
                          {u.first_name ? `${u.first_name} ${u.last_name}` : u.email}
                        </Box>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={(u.role || 'resident').replace('_', ' ')} size="small" color={roleColor(u.role)} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '--'}</TableCell>
                      <TableCell>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>
                        <Chip label={u.is_active !== false ? 'Active' : 'Inactive'} size="small"
                          color={u.is_active !== false ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => { setEditUser(u); setEditRole(u.role || 'resident'); }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
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

      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            {editUser?.first_name} {editUser?.last_name} ({editUser?.email})
          </Typography>
          <Select fullWidth value={editRole} onChange={(e) => setEditRole(e.target.value)}>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r.replace('_', ' ')}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleChange} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
