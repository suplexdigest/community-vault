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
const GOLD = '#C5A258';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/properties/${id}/`);
        setProperty(data);
      } catch {
        navigate('/app/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!property) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/properties')} sx={{ color: 'text.secondary' }}>
          Back
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
            {property.address || property.street_address}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {property.unit_number ? `Unit ${property.unit_number}` : ''} {property.city}, {property.state} {property.zip_code}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Edit</Button>
          <Button variant="outlined" startIcon={<DeleteIcon />} color="error">Delete</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Property Type</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.property_type || 'Single Family'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Status</Typography>
              <Chip label={property.status || 'Active'} color="success" size="small" sx={{ mt: 0.5 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Owner</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.owner_name || property.owner?.name || 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Balance Due</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: (property.balance || 0) > 0 ? 'error.main' : 'success.main' }}>
                ${(property.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Details" />
          <Tab label="Assessments" />
          <Tab label="Violations" />
          <Tab label="Work Orders" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Grid container spacing={2}>
              {[
                { label: 'Bedrooms', value: property.bedrooms },
                { label: 'Bathrooms', value: property.bathrooms },
                { label: 'Square Footage', value: property.square_footage ? `${property.square_footage.toLocaleString()} sq ft` : null },
                { label: 'Year Built', value: property.year_built },
                { label: 'Lot Size', value: property.lot_size },
                { label: 'Parking Spaces', value: property.parking_spaces },
                { label: 'HOA Lot Number', value: property.lot_number },
                { label: 'Section', value: property.section },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.label}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{item.value || '--'}</Typography>
                </Grid>
              ))}
            </Grid>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(property.assessments || []).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell>${(a.amount || 0).toFixed(2)}</TableCell>
                      <TableCell><Chip label={a.status} size="small" color={a.status === 'paid' ? 'success' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                  {(!property.assessments || property.assessments.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No assessments</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fine</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(property.violations || []).map((v) => (
                    <TableRow key={v.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/violations/${v.id}`)}>
                      <TableCell>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{v.violation_type || v.type}</TableCell>
                      <TableCell><Chip label={v.status} size="small" color={v.status === 'resolved' ? 'success' : 'error'} /></TableCell>
                      <TableCell>{v.fine_amount ? `$${v.fine_amount.toFixed(2)}` : '--'}</TableCell>
                    </TableRow>
                  ))}
                  {(!property.violations || property.violations.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No violations</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 3 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(property.work_orders || []).map((w) => (
                    <TableRow key={w.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/app/maintenance/${w.id}`)}>
                      <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{w.title}</TableCell>
                      <TableCell><Chip label={w.priority} size="small" color={w.priority === 'high' ? 'error' : w.priority === 'medium' ? 'warning' : 'default'} /></TableCell>
                      <TableCell><Chip label={w.status} size="small" color={w.status === 'completed' ? 'success' : 'info'} /></TableCell>
                    </TableRow>
                  ))}
                  {(!property.work_orders || property.work_orders.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No work orders</TableCell></TableRow>
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
