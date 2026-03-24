import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  CircularProgress, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/client';

const GREEN = '#1B4332';

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/work-orders/${id}/`);
        setOrder(data);
      } catch { navigate('/app/maintenance'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!order) return null;

  const priorityColor = (p) => {
    const map = { urgent: 'error', high: 'error', medium: 'warning', low: 'default' };
    return map[p] || 'default';
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/maintenance')} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
              Work Order #{order.id}
            </Typography>
            <Chip label={(order.status || 'open').replace('_', ' ')} color={order.status === 'completed' ? 'success' : 'info'} />
            <Chip label={order.priority || 'medium'} color={priorityColor(order.priority)} variant="outlined" />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>{order.title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Edit</Button>
          <Button variant="outlined" startIcon={<DeleteIcon />} color="error">Delete</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Location</Typography>
            <Typography sx={{ fontWeight: 700 }}>{order.location || order.property_address || '--'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Category</Typography>
            <Typography sx={{ fontWeight: 700 }}>{order.category || 'General'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Assigned To</Typography>
            <Typography sx={{ fontWeight: 700 }}>{order.assigned_to_name || order.assigned_to || 'Unassigned'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Estimated Cost</Typography>
            <Typography sx={{ fontWeight: 700 }}>{order.estimated_cost ? `$${order.estimated_cost.toFixed(2)}` : 'TBD'}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Description</Typography>
          <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{order.description || 'No description provided.'}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Timeline</Typography>
              {[
                { label: 'Submitted', value: order.created_at },
                { label: 'Acknowledged', value: order.acknowledged_at },
                { label: 'Work Started', value: order.started_at },
                { label: 'Completed', value: order.completed_at },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {item.value ? new Date(item.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '--'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Comments</Typography>
              {(order.comments || []).length === 0 ? (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>No comments yet</Typography>
              ) : (
                order.comments.map((c, idx) => (
                  <Box key={c.id || idx} sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author_name || 'System'}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem' }}>{c.text || c.comment}</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
