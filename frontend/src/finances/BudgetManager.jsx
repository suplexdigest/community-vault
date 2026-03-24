import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, LinearProgress, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import api from '../api/client';
import EmptyState from '../components/common/EmptyState';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export default function BudgetManager() {
  const [budgetItems, setBudgetItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, summaryRes] = await Promise.allSettled([
          api.get('/budget/items/'),
          api.get('/budget/summary/'),
        ]);
        if (itemsRes.status === 'fulfilled') {
          const data = itemsRes.value.data;
          setBudgetItems(Array.isArray(data) ? data : data.results || []);
        }
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const fmt = (val) => val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Budget Manager</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Track budgeted vs. actual spending by category</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#2D6A4F' } }}>
          Add Budget Line
        </Button>
      </Box>

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Budget</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN }}>{fmt(summary.total_budget)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Spent</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#c62828' }}>{fmt(summary.total_spent)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card><CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Remaining</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>{fmt(summary.remaining)}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card>
        {budgetItems.length === 0 ? (
          <EmptyState icon={AccountBalanceWalletIcon} title="No budget lines" description="Add budget line items to track spending by category." actionLabel="Add Budget Line" onAction={() => {}} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Budgeted</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Spent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 200 }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetItems.map((item) => {
                  const pct = item.budgeted > 0 ? Math.round((item.spent / item.budgeted) * 100) : 0;
                  const over = pct > 100;
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{item.category || item.name}</TableCell>
                      <TableCell>{fmt(item.budgeted)}</TableCell>
                      <TableCell>{fmt(item.spent)}</TableCell>
                      <TableCell sx={{ color: over ? 'error.main' : 'success.main', fontWeight: 600 }}>
                        {fmt((item.budgeted || 0) - (item.spent || 0))}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(pct, 100)}
                            sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': { bgcolor: over ? '#c62828' : GREEN } }}
                          />
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 36 }}>{pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={over ? 'Over Budget' : 'On Track'} size="small"
                          color={over ? 'error' : 'success'} />
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
