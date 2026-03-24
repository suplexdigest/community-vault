import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  CircularProgress, Divider, Alert, Switch, FormControlLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import api from '../api/client';
import { useSnackbar } from '../components/common/SnackbarProvider';

const GREEN = '#1B4332';

export default function SettingsPage() {
  const { success, error: showError } = useSnackbar();
  const [settings, setSettings] = useState({
    community_name: '', address: '', city: '', state: '', zip_code: '',
    phone: '', email: '', website: '',
    fiscal_year_start: '', late_fee_amount: '', late_fee_grace_days: '',
    enable_online_payments: true, enable_violation_photos: true,
    enable_resident_portal: true, enable_amenity_booking: true,
    enable_arb_submissions: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/settings/');
        setSettings((prev) => ({ ...prev, ...data }));
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/', settings);
      success('Settings saved successfully!');
    } catch {
      showError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Settings</Typography>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}
          sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem', mb: 2 }}>
                Community Information
              </Typography>
              <TextField label="Community Name" fullWidth value={settings.community_name}
                onChange={handleChange('community_name')} sx={{ mb: 2 }} />
              <TextField label="Address" fullWidth value={settings.address}
                onChange={handleChange('address')} sx={{ mb: 2 }} />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 5 }}>
                  <TextField label="City" fullWidth value={settings.city} onChange={handleChange('city')} />
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <TextField label="State" fullWidth value={settings.state} onChange={handleChange('state')} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField label="ZIP" fullWidth value={settings.zip_code} onChange={handleChange('zip_code')} />
                </Grid>
              </Grid>
              <TextField label="Phone" fullWidth value={settings.phone}
                onChange={handleChange('phone')} sx={{ mb: 2 }} />
              <TextField label="Email" fullWidth value={settings.email}
                onChange={handleChange('email')} sx={{ mb: 2 }} />
              <TextField label="Website" fullWidth value={settings.website}
                onChange={handleChange('website')} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem', mb: 2 }}>
                Financial Settings
              </Typography>
              <TextField label="Fiscal Year Start (MM-DD)" fullWidth value={settings.fiscal_year_start}
                onChange={handleChange('fiscal_year_start')} sx={{ mb: 2 }} placeholder="01-01" />
              <TextField label="Late Fee Amount ($)" fullWidth type="number" value={settings.late_fee_amount}
                onChange={handleChange('late_fee_amount')} sx={{ mb: 2 }} />
              <TextField label="Late Fee Grace Period (days)" fullWidth type="number" value={settings.late_fee_grace_days}
                onChange={handleChange('late_fee_grace_days')} />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem', mb: 2 }}>
                Feature Toggles
              </Typography>
              {[
                { field: 'enable_online_payments', label: 'Enable Online Payments' },
                { field: 'enable_violation_photos', label: 'Require Violation Photos' },
                { field: 'enable_resident_portal', label: 'Enable Resident Portal' },
                { field: 'enable_amenity_booking', label: 'Enable Amenity Booking' },
                { field: 'enable_arb_submissions', label: 'Enable ARB Submissions' },
              ].map((item) => (
                <FormControlLabel key={item.field}
                  control={<Switch checked={!!settings[item.field]} onChange={handleChange(item.field)} color="primary" />}
                  label={item.label}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
