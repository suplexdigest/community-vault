import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, CircularProgress, Link, ToggleButtonGroup, ToggleButton,
  InputAdornment, IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from './AuthContext';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [mode, setMode] = useState('join');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '',
    community_code: '', community_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      };
      if (mode === 'join') {
        payload.community_code = form.community_code;
      } else {
        payload.community_name = form.community_name;
        payload.create_community = true;
      }
      await register(payload);
      navigate('/app');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = typeof data === 'string' ? data
          : data.detail || Object.values(data).flat().join(' ');
        setError(msg);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${GREEN} 0%, #2D6A4F 50%, ${GREEN} 100%)`,
      p: 2,
    }}>
      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box component="img" src="/favicon.svg" alt="CommunityVault" sx={{ width: 48, height: 48, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
              Create Account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
              Join or create your community
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val) => val && setMode(val)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="join" sx={{ textTransform: 'none', fontWeight: 600 }}>
              <GroupAddIcon sx={{ mr: 1 }} /> Join Existing
            </ToggleButton>
            <ToggleButton value="create" sx={{ textTransform: 'none', fontWeight: 600 }}>
              <HomeWorkIcon sx={{ mr: 1 }} /> Create New
            </ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                fullWidth
                required
                value={form.first_name}
                onChange={handleChange('first_name')}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Last Name"
                fullWidth
                required
                value={form.last_name}
                onChange={handleChange('last_name')}
              />
            </Box>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange('email')}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={form.password}
              onChange={handleChange('password')}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              sx={{ mb: 2 }}
            />

            {mode === 'join' ? (
              <TextField
                label="Community Invite Code"
                fullWidth
                required
                value={form.community_code}
                onChange={handleChange('community_code')}
                helperText="Ask your HOA manager for the invite code"
                sx={{ mb: 3 }}
              />
            ) : (
              <TextField
                label="Community Name"
                fullWidth
                required
                value={form.community_name}
                onChange={handleChange('community_name')}
                placeholder="e.g. Oakwood Estates HOA"
                helperText="You will be the admin of this community"
                sx={{ mb: 3 }}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: GREEN, py: 1.5, fontWeight: 700, fontSize: '1rem',
                '&:hover': { bgcolor: '#2D6A4F' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: GOLD, fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
