import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Menu,
  MenuItem, Collapse, useMediaQuery, useTheme, Select, FormControl,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SavingsIcon from '@mui/icons-material/Savings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CampaignIcon from '@mui/icons-material/Campaign';
import PoolIcon from '@mui/icons-material/Pool';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HistoryIcon from '@mui/icons-material/History';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../auth/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { useThemeMode } from '../theme/ThemeContext';

const DRAWER_WIDTH = 270;
const GREEN = '#1B4332';
const GOLD = '#C5A258';

const navSections = [
  {
    label: 'Dashboard',
    items: [{ label: 'Dashboard', path: '/app', icon: <DashboardIcon /> }],
    minRole: 'resident',
  },
  {
    label: 'Properties',
    items: [
      { label: 'Properties', path: '/app/properties', icon: <HomeWorkIcon /> },
      { label: 'Owners', path: '/app/owners', icon: <PeopleIcon /> },
      { label: 'Residents', path: '/app/residents', icon: <PersonIcon /> },
    ],
    minRole: 'board_member',
  },
  {
    label: 'Finances',
    items: [
      { label: 'Dashboard', path: '/app/finances', icon: <AccountBalanceIcon /> },
      { label: 'Assessments', path: '/app/finances/assessments', icon: <ReceiptIcon /> },
      { label: 'Payments', path: '/app/finances/payments', icon: <PaymentIcon /> },
      { label: 'Expenses', path: '/app/finances/expenses', icon: <MoneyOffIcon /> },
      { label: 'Budget', path: '/app/finances/budget', icon: <AccountBalanceWalletIcon /> },
      { label: 'Vendors', path: '/app/finances/vendors', icon: <StorefrontIcon /> },
      { label: 'Reserves', path: '/app/finances/reserves', icon: <SavingsIcon /> },
    ],
    minRole: 'treasurer',
  },
  {
    label: 'Compliance',
    items: [
      { label: 'Violations', path: '/app/violations', icon: <ReportProblemIcon /> },
      { label: 'Violation Types', path: '/app/violations/types', icon: <CategoryIcon /> },
    ],
    minRole: 'board_member',
  },
  {
    label: 'Maintenance',
    items: [
      { label: 'Work Orders', path: '/app/maintenance', icon: <BuildIcon /> },
    ],
    minRole: 'resident',
  },
  {
    label: 'Governance',
    items: [
      { label: 'Meetings', path: '/app/meetings', icon: <EventIcon /> },
      { label: 'Documents', path: '/app/documents', icon: <DescriptionIcon /> },
    ],
    minRole: 'board_member',
  },
  {
    label: 'Architectural',
    items: [
      { label: 'ARB Requests', path: '/app/architectural', icon: <ArchitectureIcon /> },
    ],
    minRole: 'resident',
  },
  {
    label: 'Community',
    items: [
      { label: 'Announcements', path: '/app/announcements', icon: <CampaignIcon /> },
      { label: 'Amenities', path: '/app/amenities', icon: <PoolIcon /> },
    ],
    minRole: 'resident',
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports Dashboard', path: '/app/reports', icon: <AssessmentIcon /> },
      { label: 'Financial Report', path: '/app/reports/financial', icon: <BarChartIcon /> },
      { label: 'Delinquency', path: '/app/reports/delinquency', icon: <TrendingDownIcon /> },
    ],
    minRole: 'treasurer',
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', path: '/app/admin/users', icon: <AdminPanelSettingsIcon /> },
      { label: 'Settings', path: '/app/settings', icon: <SettingsIcon /> },
      { label: 'Audit Log', path: '/app/admin/audit-log', icon: <HistoryIcon /> },
    ],
    minRole: 'admin',
  },
];

const ROLE_HIERARCHY = {
  resident: 0, board_member: 1, treasurer: 2, secretary: 3,
  president: 4, manager: 5, admin: 6,
};

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasMinRole } = useAuth();
  const { community, communities, switchCommunity } = useCommunity();
  const { mode, toggleTheme } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const userRole = user?.role || 'resident';
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box component="img" src="/favicon.svg" alt="CommunityVault" sx={{ width: 32, height: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', fontSize: '1.05rem' }}>
          CommunityVault
        </Typography>
      </Box>
      <Divider />

      {communities.length > 1 && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={community?.id || ''}
              onChange={(e) => switchCommunity(e.target.value)}
              sx={{ fontSize: '0.85rem' }}
            >
              {communities.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {navSections.map((section) => {
          const minLevel = ROLE_HIERARCHY[section.minRole] ?? 0;
          if (userLevel < minLevel) return null;

          const hasMultiple = section.items.length > 1;
          const isOpen = openSections[section.label] !== false;

          if (!hasMultiple) {
            const item = section.items[0];
            const active = location.pathname === item.path;
            return (
              <ListItem key={section.label} disablePadding>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  selected={active}
                  sx={{
                    mx: 1, borderRadius: 2, mb: 0.5,
                    '&.Mui-selected': { bgcolor: `${GREEN}12`, color: GREEN },
                    '&.Mui-selected .MuiListItemIcon-root': { color: GREEN },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? GREEN : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 400 }} />
                </ListItemButton>
              </ListItem>
            );
          }

          return (
            <Box key={section.label}>
              <ListItemButton onClick={() => toggleSection(section.label)} sx={{ mx: 1, borderRadius: 2 }}>
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
                />
                {isOpen ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto">
                <List disablePadding>
                  {section.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <ListItem key={item.path} disablePadding>
                        <ListItemButton
                          onClick={() => handleNav(item.path)}
                          selected={active}
                          sx={{
                            mx: 1, pl: 3, borderRadius: 2, mb: 0.25,
                            '&.Mui-selected': { bgcolor: `${GREEN}12`, color: GREEN },
                            '&.Mui-selected .MuiListItemIcon-root': { color: GREEN },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: active ? GREEN : 'text.secondary', '& svg': { fontSize: 20 } }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active ? 600 : 400 }} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: GREEN, width: 32, height: 32, fontSize: '0.8rem' }}>
          {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'capitalize' }}>
            {userRole.replace('_', ' ')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: GREEN,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1rem' }} noWrap>
            {community?.name || 'CommunityVault'}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: GOLD, color: GREEN, width: 32, height: 32, fontSize: '0.8rem' }}>
              {user?.first_name?.[0] || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography sx={{ fontSize: '0.85rem' }}>
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} /> Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box component="main" sx={{
        flexGrow: 1, p: 3,
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        mt: '64px',
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
