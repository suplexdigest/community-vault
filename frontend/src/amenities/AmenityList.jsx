import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, CardMedia, Grid,
  Chip, CircularProgress, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PoolIcon from '@mui/icons-material/Pool';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../auth/AuthContext';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export default function AmenityList() {
  const navigate = useNavigate();
  const { hasMinRole } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/amenities/', { params: { search } });
        const list = Array.isArray(data) ? data : data.results || [];
        setAmenities(list);
      } catch { setAmenities([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Amenities</Typography>
        {hasMinRole('board_member') && (
          <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
            Add Amenity
          </Button>
        )}
      </Box>

      <TextField placeholder="Search amenities..." size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3, maxWidth: 400 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : amenities.length === 0 ? (
        <Card>
          <EmptyState icon={PoolIcon} title="No amenities" description="Community amenities like pools, clubhouses, and courts will appear here." />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {amenities.map((a) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.id}>
              <Card sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                {a.image_url && (
                  <CardMedia component="img" height={160} image={a.image_url} alt={a.name} />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1.05rem' }}>
                      {a.name}
                    </Typography>
                    <Chip label={a.status || 'Open'} size="small"
                      color={a.status === 'closed' || a.status === 'maintenance' ? 'error' : 'success'} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 2 }}>
                    {a.description || 'No description available.'}
                  </Typography>
                  {a.hours && (
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1 }}>
                      Hours: {a.hours}
                    </Typography>
                  )}
                  {a.capacity && (
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
                      Capacity: {a.capacity} people
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EventAvailableIcon />}
                    onClick={() => navigate(`/app/amenities/${a.id}/reserve`)}
                    sx={{ color: GOLD, borderColor: GOLD, '&:hover': { bgcolor: `${GOLD}08` } }}
                    disabled={a.status === 'closed' || a.status === 'maintenance'}
                  >
                    Reserve
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
