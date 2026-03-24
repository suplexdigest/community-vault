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

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/meetings/${id}/`);
        setMeeting(data);
      } catch { navigate('/app/meetings'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!meeting) return null;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/meetings')} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
            {meeting.title || meeting.name}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '--'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Edit</Button>
          <Button variant="outlined" startIcon={<DeleteIcon />} color="error">Delete</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Type', value: meeting.meeting_type || meeting.type || 'Board Meeting' },
          { label: 'Location', value: meeting.location || 'TBD' },
          { label: 'Quorum', value: meeting.quorum_met ? 'Met' : 'Not Met' },
          { label: 'Status', value: meeting.status || 'scheduled' },
        ].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{item.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Agenda" />
          <Tab label="Minutes" />
          <Tab label="Attendance" />
          <Tab label="Votes" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Box>
              {meeting.agenda ? (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{meeting.agenda}</Typography>
              ) : (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>No agenda items added</Typography>
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box>
              {meeting.minutes ? (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{meeting.minutes}</Typography>
              ) : (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>No minutes recorded</Typography>
              )}
            </Box>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Present</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {(meeting.attendees || []).map((a, idx) => (
                    <TableRow key={a.id || idx}>
                      <TableCell>{a.name || `${a.first_name} ${a.last_name}`}</TableCell>
                      <TableCell>{a.role || 'Member'}</TableCell>
                      <TableCell>
                        <Chip label={a.present ? 'Present' : 'Absent'} size="small"
                          color={a.present ? 'success' : 'error'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!meeting.attendees || meeting.attendees.length === 0) && (
                    <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary' }}>No attendance recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 3 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Motion</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Moved By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Seconded By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>For</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Against</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {(meeting.votes || []).map((v, idx) => (
                    <TableRow key={v.id || idx}>
                      <TableCell>{v.motion || v.description}</TableCell>
                      <TableCell>{v.moved_by || '--'}</TableCell>
                      <TableCell>{v.seconded_by || '--'}</TableCell>
                      <TableCell>{v.votes_for ?? '--'}</TableCell>
                      <TableCell>{v.votes_against ?? '--'}</TableCell>
                      <TableCell>
                        <Chip label={v.result || 'pending'} size="small"
                          color={v.result === 'passed' ? 'success' : v.result === 'failed' ? 'error' : 'warning'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!meeting.votes || meeting.votes.length === 0) && (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>No votes recorded</TableCell></TableRow>
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
