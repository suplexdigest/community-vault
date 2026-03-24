import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export default function ReserveFunds() {
  const [funds, setFunds] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsRes, summaryRes] = await Promise.allSettled([
          api.get('/reserves/'),
          api.get('/reserves/summary/'),
        ]);
        if (fundsRes.status === 'fulfilled') {
          const data = fundsRes.value.data;
          setFunds(Array.isArray(data) ? data : data.results || []);
        }
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const fmt = (val) => val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Reserve Funds</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Track reserve fund balances and contributions</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Add Reserve Fund
        </Button>
      </Box>

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Reserve Balance</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: GOLD }}>{fmt(summary.total_balance)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Target Funding</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN }}>{fmt(summary.target_funding)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Funding Percentage</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: (summary.funding_pct || 0) >= 70 ? '#2e7d32' : '#c62828' }}>
                {summary.funding_pct ?? '--'}%
              </Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card>
        {funds.length === 0 ? (
          <EmptyState icon={SavingsIcon} title="No reserve funds" description="Create reserve funds to plan for future capital expenditures." actionLabel="Add Reserve Fund" onAction={() => {}} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fund Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Current Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Monthly Contribution</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 180 }}>Funded</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funds.map((f) => {
                  const pct = f.target > 0 ? Math.round((f.balance / f.target) * 100) : 0;
                  return (
                    <TableRow key={f.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{f.name}</TableCell>
                      <TableCell>{fmt(f.balance)}</TableCell>
                      <TableCell>{fmt(f.target)}</TableCell>
                      <TableCell>{fmt(f.monthly_contribution)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                            sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': { bgcolor: pct >= 70 ? '#2e7d32' : pct >= 40 ? GOLD : '#c62828' } }} />
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 36 }}>{pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={pct >= 70 ? 'Healthy' : pct >= 40 ? 'Caution' : 'Underfunded'} size="small"
                          color={pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
