import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  CircularProgress, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api/client';

const GREEN = '#1B4332';

export default function ARBRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/architectural-requests/${id}/`);
        setRequest(data);
      } catch { navigate('/app/architectural'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!request) return null;

  const statusColor = (s) => {
    const map = { submitted: 'info', under_review: 'warning', approved: 'success', approved_with_conditions: 'success', denied: 'error' };
    return map[s] || 'default';
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/architectural')} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
              ARB Request #{request.id}
            </Typography>
            <Chip label={(request.status || 'submitted').replace('_', ' ')} color={statusColor(request.status)} />
          </Box>
          <Typography sx={{ color: 'text.secondary' }}>
            {request.property_address} | {request.project_type || 'Modification'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<CheckIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>Approve</Button>
          <Button variant="outlined" startIcon={<CloseIcon />} color="error">Deny</Button>
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Edit</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Submitted', value: request.submitted_date ? new Date(request.submitted_date).toLocaleDateString() : '--' },
          { label: 'Owner', value: request.owner_name || '--' },
          { label: 'Estimated Cost', value: request.estimated_cost ? `$${Number(request.estimated_cost).toLocaleString()}` : 'Not specified' },
          { label: 'Est. Completion', value: request.estimated_completion ? new Date(request.estimated_completion).toLocaleDateString() : 'Not specified' },
        ].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{item.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Project Description</Typography>
          <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', mb: 3 }}>
            {request.description || 'No description provided.'}
          </Typography>

          {request.materials && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Materials & Specifications</Typography>
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{request.materials}</Typography>
            </>
          )}

          {request.contractor && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Contractor Information</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{request.contractor}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      {request.attachments && request.attachments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Attachments & Plans</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {request.attachments.map((att, i) => (
                <Chip key={i} label={att.name || `Attachment ${i + 1}`} variant="outlined"
                  onClick={() => window.open(att.url, '_blank')} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {request.conditions && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Conditions of Approval</Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{request.conditions}</Typography>
          </CardContent>
        </Card>
      )}

      {request.review_notes && (
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Board Review Notes</Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{request.review_notes}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
