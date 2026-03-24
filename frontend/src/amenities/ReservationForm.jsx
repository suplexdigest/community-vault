import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../api/client';
import { useSnackbar } from '../components/common/SnackbarProvider';

const GREEN = '#1B4332';

export default function ReservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useSnackbar();
  const [amenity, setAmenity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: '', start_time: '', end_time: '', guests: '', notes: '',
  });
  const [errors, setErrors] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/amenities/${id}/`);
        setAmenity(data);
      } catch { navigate('/app/amenities'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setSubmitting(true);
    try {
      await api.post(`/amenities/${id}/reservations/`, {
        ...form,
        guests: form.guests ? parseInt(form.guests, 10) : 0,
      });
      success('Reservation submitted successfully!');
      navigate('/app/amenities');
    } catch (err) {
      const data = err.response?.data;
      showError(typeof data === 'string' ? data : data?.detail || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!amenity) return null;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/amenities')} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>

      <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', mb: 1 }}>
        Reserve {amenity.name}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        {amenity.description || 'Fill out the form below to reserve this amenity.'}
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 3 }}>
          {errors && <Alert severity="error" sx={{ mb: 2 }}>{errors}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Date" type="date" fullWidth required
              value={form.date} onChange={handleChange('date')}
              sx={{ mb: 2 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Start Time" type="time" fullWidth required
                  value={form.start_time} onChange={handleChange('start_time')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="End Time" type="time" fullWidth required
                  value={form.end_time} onChange={handleChange('end_time')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Number of Guests" type="number" fullWidth
              value={form.guests} onChange={handleChange('guests')}
              sx={{ mb: 2 }}
              helperText={amenity.capacity ? `Maximum capacity: ${amenity.capacity}` : ''}
            />
            <TextField
              label="Notes or Special Requests" multiline rows={3} fullWidth
              value={form.notes} onChange={handleChange('notes')}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit" variant="contained" fullWidth disabled={submitting}
              startIcon={<EventAvailableIcon />}
              sx={{ bgcolor: GREEN, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#2D6A4F' } }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Submit Reservation'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
