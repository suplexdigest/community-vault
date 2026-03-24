import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea, Chip,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

const reports = [
  {
    title: 'Financial Report',
    description: 'Income statement, balance sheet, budget vs. actual, and cash flow analysis for the current fiscal year.',
    icon: <BarChartIcon />,
    path: '/app/reports/financial',
    category: 'Financial',
  },
  {
    title: 'Delinquency Report',
    description: 'Aging report of all outstanding balances, delinquent accounts, and collection status by property.',
    icon: <TrendingDownIcon />,
    path: '/app/reports/delinquency',
    category: 'Financial',
  },
  {
    title: 'Reserve Fund Analysis',
    description: 'Reserve fund balances, funding percentages, projected contributions, and replacement schedules.',
    icon: <AccountBalanceIcon />,
    path: '/app/finances/reserves',
    category: 'Financial',
  },
  {
    title: 'Property Directory',
    description: 'Complete listing of all properties with owner contact information, unit details, and account status.',
    icon: <HomeWorkIcon />,
    path: '/app/properties',
    category: 'Community',
  },
  {
    title: 'Violation Summary',
    description: 'Summary of all violations by type, status, and property. Includes compliance rates and trends.',
    icon: <ReportProblemIcon />,
    path: '/app/violations',
    category: 'Compliance',
  },
  {
    title: 'Resident Directory',
    description: 'Directory of all residents with contact information, unit assignments, and move-in dates.',
    icon: <PeopleIcon />,
    path: '/app/residents',
    category: 'Community',
  },
];

export default function ReportsDashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif' }}>
          Reports Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Generate and view community reports</Typography>
      </Box>

      <Grid container spacing={3}>
        {reports.map((r) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.title}>
            <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <CardActionArea onClick={() => navigate(r.path)} sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: `${GREEN}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: GREEN, '& svg': { fontSize: 26 },
                  }}>
                    {r.icon}
                  </Box>
                  <Chip label={r.category} size="small" sx={{ bgcolor: `${GOLD}20`, color: GOLD, fontWeight: 600 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, fontSize: '1.05rem', mb: 1 }}>
                  {r.title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {r.description}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
