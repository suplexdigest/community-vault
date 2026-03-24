import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress,
  Button, Divider,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import api from '../api/client';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

function FinanceCard({ title, value, subtitle, icon: Icon, color = GREEN, onClick }) {
  return (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {} }}
      onClick={onClick}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500, mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color, fontFamily: '"Georgia", serif' }}>{value}</Typography>
            {subtitle && <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 26 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/finances/dashboard/');
        setStats(data);
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const fmt = (val) => val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Financial Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Overview of community finances</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Total Revenue (YTD)" value={fmt(stats?.total_revenue)} subtitle="Assessments + payments collected"
            icon={TrendingUpIcon} color="#2e7d32" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Outstanding Assessments" value={fmt(stats?.outstanding_assessments)} subtitle={`${stats?.delinquent_accounts ?? '--'} delinquent accounts`}
            icon={ReceiptIcon} color="#c62828" onClick={() => navigate('/app/finances/assessments')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Total Expenses (YTD)" value={fmt(stats?.total_expenses)} subtitle="Operating + maintenance"
            icon={MoneyOffIcon} color="#e65100" onClick={() => navigate('/app/finances/expenses')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Operating Balance" value={fmt(stats?.operating_balance)}
            icon={AccountBalanceIcon} onClick={() => navigate('/app/finances/budget')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Reserve Fund Balance" value={fmt(stats?.reserve_balance)}
            icon={SavingsIcon} color={GOLD} onClick={() => navigate('/app/finances/reserves')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FinanceCard title="Payments This Month" value={fmt(stats?.payments_this_month)} subtitle={`${stats?.payments_count ?? '--'} transactions`}
            icon={PaymentIcon} color="#2e7d32" onClick={() => navigate('/app/finances/payments')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem', mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" fullWidth onClick={() => navigate('/app/finances/payments')} sx={{ justifyContent: 'flex-start', color: GREEN, borderColor: GREEN }}>
                  Record a Payment
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/app/finances/assessments')} sx={{ justifyContent: 'flex-start', color: GREEN, borderColor: GREEN }}>
                  Create Assessment
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/app/finances/expenses')} sx={{ justifyContent: 'flex-start', color: GREEN, borderColor: GREEN }}>
                  Log an Expense
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/app/reports/financial')} sx={{ justifyContent: 'flex-start', color: GOLD, borderColor: GOLD }}>
                  Generate Financial Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1rem', mb: 2 }}>Budget vs. Actual</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Budgeted Revenue</Typography>
                <Typography sx={{ fontWeight: 600 }}>{fmt(stats?.budgeted_revenue)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Actual Revenue</Typography>
                <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>{fmt(stats?.total_revenue)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Budgeted Expenses</Typography>
                <Typography sx={{ fontWeight: 600 }}>{fmt(stats?.budgeted_expenses)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Actual Expenses</Typography>
                <Typography sx={{ fontWeight: 600, color: '#c62828' }}>{fmt(stats?.total_expenses)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
