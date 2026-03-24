import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';

export default function DelinquencyReport() {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, accountsRes] = await Promise.allSettled([
          api.get('/reports/delinquency/summary/'),
          api.get('/reports/delinquency/'),
        ]);
        if (summaryRes.status === 'fulfilled') setData(summaryRes.value.data);
        if (accountsRes.status === 'fulfilled') {
          const list = accountsRes.value.data;
          setAccounts(Array.isArray(list) ? list : list.results || []);
        }
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const fmt = (val) => val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--';

  const agingColor = (days) => {
    if (days > 90) return 'error';
    if (days > 60) return 'warning';
    if (days > 30) return 'info';
    return 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Delinquency Report</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Outstanding balances and aging analysis</Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ color: GREEN, borderColor: GREEN }}>
          Export CSV
        </Button>
      </Box>

      {data && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Outstanding</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#c62828' }}>{fmt(data.total_outstanding)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Delinquent Accounts</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN }}>{data.delinquent_count ?? '--'}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>30-60 Days</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#e65100' }}>{fmt(data.aging_30_60)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>90+ Days</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#c62828' }}>{fmt(data.aging_90_plus)}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card>
        {accounts.length === 0 ? (
          <EmptyState icon={TrendingDownIcon} title="No delinquent accounts" description="All accounts are current. Great job!" />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Days Overdue</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Aging</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.property_address || '--'}</TableCell>
                    <TableCell>{a.owner_name || '--'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>{fmt(a.balance)}</TableCell>
                    <TableCell>{a.days_overdue ?? '--'}</TableCell>
                    <TableCell>{a.last_payment_date ? new Date(a.last_payment_date).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <Chip label={a.days_overdue > 90 ? '90+' : a.days_overdue > 60 ? '60-90' : a.days_overdue > 30 ? '30-60' : '0-30'}
                        size="small" color={agingColor(a.days_overdue)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={a.collection_status || 'delinquent'} size="small"
                        color={a.collection_status === 'lien' ? 'error' : 'warning'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
