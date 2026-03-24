import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Divider, Tabs, Tab, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import api from '../api/client';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export default function FinancialReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('ytd');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/reports/financial/', { params: { period } });
        setReport(data);
      } catch { setReport({}); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [period]);

  const fmt = (val) => val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--';

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>Financial Report</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Income, expenses, and financial health overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="ytd">Year to Date</MenuItem>
              <MenuItem value="monthly">This Month</MenuItem>
              <MenuItem value="quarterly">This Quarter</MenuItem>
              <MenuItem value="annual">Full Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ color: GREEN, borderColor: GREEN }}>Export PDF</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Revenue</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>{fmt(report?.total_revenue)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Total Expenses</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#c62828' }}>{fmt(report?.total_expenses)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Net Income</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: (report?.net_income || 0) >= 0 ? '#2e7d32' : '#c62828' }}>
              {fmt(report?.net_income)}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Collection Rate</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN }}>{report?.collection_rate ?? '--'}%</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Income Statement" />
          <Tab label="Expense Breakdown" />
          <Tab label="Budget vs. Actual" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Revenue</TableCell></TableRow>
                  {(report?.revenue_items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ pl: 4 }}>{item.category}</TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32' }}>{fmt(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#2e7d32' }}>{fmt(report?.total_revenue)}</TableCell>
                  </TableRow>
                  <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Expenses</TableCell></TableRow>
                  {(report?.expense_items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ pl: 4 }}>{item.category}</TableCell>
                      <TableCell align="right" sx={{ color: '#c62828' }}>{fmt(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Total Expenses</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#c62828' }}>{fmt(report?.total_expenses)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1.05rem' }}>Net Income</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.05rem', color: (report?.net_income || 0) >= 0 ? '#2e7d32' : '#c62828' }}>
                      {fmt(report?.net_income)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>% of Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report?.expense_breakdown || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{fmt(item.amount)}</TableCell>
                      <TableCell align="right">{item.percentage ?? '--'}%</TableCell>
                    </TableRow>
                  ))}
                  {(!report?.expense_breakdown || report.expense_breakdown.length === 0) && (
                    <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary' }}>No expense data available</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Budgeted</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actual</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Variance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report?.budget_comparison || []).map((item, i) => {
                    const variance = (item.budgeted || 0) - (item.actual || 0);
                    return (
                      <TableRow key={i}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{fmt(item.budgeted)}</TableCell>
                        <TableCell align="right">{fmt(item.actual)}</TableCell>
                        <TableCell align="right" sx={{ color: variance >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                          {fmt(Math.abs(variance))} {variance >= 0 ? 'under' : 'over'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!report?.budget_comparison || report.budget_comparison.length === 0) && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>No budget data available</TableCell></TableRow>
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
