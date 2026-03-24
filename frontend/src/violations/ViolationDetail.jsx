import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  CircularProgress, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/client';

const GREEN = '#1B4332';

export default function ViolationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/violations/${id}/`);
        setViolation(data);
      } catch { navigate('/app/violations'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!violation) return null;

  const statusColor = (s) => {
    const map = { open: 'error', pending: 'warning', resolved: 'success', appealed: 'info', closed: 'default' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/violations')} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
              Violation #{violation.id}
            </Typography>
            <Chip label={violation.status || 'open'} color={statusColor(violation.status)} />
          </Box>
          <Typography sx={{ color: 'text.secondary' }}>
            {violation.property_address || violation.property?.address} | {violation.violation_type_name || violation.type}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Edit</Button>
          <Button variant="outlined" startIcon={<DeleteIcon />} color="error">Delete</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Date Reported</Typography>
            <Typography sx={{ fontWeight: 700 }}>{violation.created_at ? new Date(violation.created_at).toLocaleDateString() : '--'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Cure Deadline</Typography>
            <Typography sx={{ fontWeight: 700, color: violation.cure_date && new Date(violation.cure_date) < new Date() ? 'error.main' : 'text.primary' }}>
              {violation.cure_date ? new Date(violation.cure_date).toLocaleDateString() : 'Not set'}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Fine Amount</Typography>
            <Typography sx={{ fontWeight: 700, color: 'error.main' }}>
              {violation.fine_amount ? `$${violation.fine_amount.toFixed(2)}` : 'No fine'}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Reported By</Typography>
            <Typography sx={{ fontWeight: 700 }}>{violation.reported_by_name || violation.reported_by || 'Board'}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Details" />
          <Tab label="Notices" />
          <Tab label="Fines" />
          <Tab label="Appeals" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Description</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3, whiteSpace: 'pre-wrap' }}>{violation.description || 'No description provided.'}</Typography>
              {violation.photos && violation.photos.length > 0 && (
                <>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Photos</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {violation.photos.map((photo, i) => (
                      <Box key={i} component="img" src={photo.url || photo} sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2 }} />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date Sent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {(violation.notices || []).map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{new Date(n.sent_date).toLocaleDateString()}</TableCell>
                      <TableCell>{n.notice_type || 'Warning'}</TableCell>
                      <TableCell>{n.method || 'Email'}</TableCell>
                      <TableCell><Chip label={n.status || 'sent'} size="small" /></TableCell>
                    </TableRow>
                  ))}
                  {(!violation.notices || violation.notices.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No notices sent</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {(violation.fines || []).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>${(f.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{f.description || '--'}</TableCell>
                      <TableCell><Chip label={f.status || 'outstanding'} size="small" color={f.status === 'paid' ? 'success' : 'error'} /></TableCell>
                    </TableRow>
                  ))}
                  {(!violation.fines || violation.fines.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No fines assessed</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 3 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date Filed</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Appellant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Decision</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {(violation.appeals || []).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.filed_date).toLocaleDateString()}</TableCell>
                      <TableCell>{a.appellant_name || '--'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</TableCell>
                      <TableCell>{a.decision || 'Pending'}</TableCell>
                      <TableCell><Chip label={a.status || 'pending'} size="small" color={a.status === 'approved' ? 'success' : a.status === 'denied' ? 'error' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                  {(!violation.appeals || violation.appeals.length === 0) && (
                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary' }}>No appeals filed</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
