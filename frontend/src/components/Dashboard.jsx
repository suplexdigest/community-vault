import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  CircularProgress, List, ListItem, ListItemText, ListItemIcon, Divider,
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

function StatCard({ title, value, subtitle, icon: Icon, color = GREEN, trend }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color, fontFamily: '"Georgia", serif' }}>
              {value}
            </Typography>
            {subtitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                {trend === 'up' && <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                {trend === 'down' && <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{subtitle}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ color, fontSize: 26 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hasMinRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, announcementsRes, meetingsRes] = await Promise.allSettled([
          api.get('/dashboard/stats/'),
          api.get('/announcements/', { params: { limit: 5 } }),
          api.get('/meetings/', { params: { upcoming: true, limit: 5 } }),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (announcementsRes.status === 'fulfilled') {
          const data = announcementsRes.value.data;
          setAnnouncements(Array.isArray(data) ? data : data.results || []);
        }
        if (meetingsRes.status === 'fulfilled') {
          const data = meetingsRes.value.data;
          setMeetings(Array.isArray(data) ? data : data.results || []);
        }
      } catch {
        // stats remain null
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isBoard = hasMinRole('board_member');
  const isTreasurer = hasMinRole('treasurer');

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
            Dashboard
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Welcome back, {user?.first_name || 'User'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {isTreasurer && (
            <Button variant="contained" startIcon={<PaymentIcon />} onClick={() => navigate('/app/finances/payments')}
              sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
              Record Payment
            </Button>
          )}
          {isBoard && (
            <Button variant="outlined" startIcon={<ReportProblemIcon />} onClick={() => navigate('/app/violations')}
              sx={{ color: GREEN, borderColor: GREEN }}>
              Create Violation
            </Button>
          )}
          <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => navigate('/app/maintenance')}
            sx={{ color: GOLD, borderColor: GOLD }}>
            Submit Work Order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Units" value={stats?.total_units ?? '--'} subtitle={`${stats?.occupied_units ?? '--'} occupied`} icon={HomeWorkIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Outstanding Assessments" value={stats?.outstanding_assessments ? `$${stats.outstanding_assessments.toLocaleString()}` : '--'}
            subtitle={`${stats?.delinquent_accounts ?? '--'} delinquent`} icon={ReceiptIcon} color="#c62828" trend="down" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Open Violations" value={stats?.open_violations ?? '--'} subtitle="Pending resolution" icon={ReportProblemIcon} color="#e65100" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Open Work Orders" value={stats?.open_work_orders ?? '--'} subtitle="In progress" icon={BuildIcon} color={GOLD} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem' }}>
                  Upcoming Meetings
                </Typography>
                <Button size="small" onClick={() => navigate('/app/meetings')} sx={{ color: GOLD }}>View All</Button>
              </Box>
              {meetings.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>No upcoming meetings</Typography>
              ) : (
                <List disablePadding>
                  {meetings.slice(0, 5).map((meeting, idx) => (
                    <Box key={meeting.id || idx}>
                      {idx > 0 && <Divider />}
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <EventIcon sx={{ color: GREEN }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={meeting.title || meeting.name}
                          secondary={meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <Chip label={meeting.type || 'Board'} size="small" sx={{ bgcolor: `${GREEN}12`, color: GREEN, fontWeight: 600 }} />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem' }}>
                  Recent Announcements
                </Typography>
                <Button size="small" onClick={() => navigate('/app/announcements')} sx={{ color: GOLD }}>View All</Button>
              </Box>
              {announcements.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>No announcements</Typography>
              ) : (
                <List disablePadding>
                  {announcements.slice(0, 5).map((ann, idx) => (
                    <Box key={ann.id || idx}>
                      {idx > 0 && <Divider />}
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CampaignIcon sx={{ color: GOLD }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={ann.title}
                          secondary={ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ''}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        {ann.priority === 'urgent' && (
                          <Chip label="Urgent" size="small" color="error" />
                        )}
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
