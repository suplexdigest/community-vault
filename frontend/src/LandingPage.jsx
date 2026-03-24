import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText,
  Divider, Chip, useMediaQuery, useTheme, Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PoolIcon from '@mui/icons-material/Pool';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ApartmentIcon from '@mui/icons-material/Apartment';
import VillaIcon from '@mui/icons-material/Villa';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BusinessIcon from '@mui/icons-material/Business';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Built For', href: '#built-for' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

const primaryFeatures = [
  { icon: <HomeWorkIcon />, title: 'Property Management', desc: 'Track every unit, lot, and common area. Manage owner records, tenant info, parking assignments, and property details all in one place.' },
  { icon: <PaymentIcon />, title: 'Assessment & Dues', desc: 'Automate recurring assessments, track payments, send late notices, and manage delinquent accounts with real-time financial visibility.' },
  { icon: <ReportProblemIcon />, title: 'Violation Tracking', desc: 'Document violations with photos, send notices, track cure deadlines, manage fines, and handle appeals -- all with a complete audit trail.' },
  { icon: <BuildIcon />, title: 'Work Orders', desc: 'Residents submit maintenance requests online. Track assignments, vendor dispatch, completion status, and costs from start to finish.' },
  { icon: <EventIcon />, title: 'Board Governance', desc: 'Schedule meetings, publish agendas, record minutes, track votes, and maintain quorum records for full transparency.' },
  { icon: <ArchitectureIcon />, title: 'Architectural Review', desc: 'Accept ARB submissions online with photos and plans. Route to committee, track approvals, conditions, and compliance.' },
];

const additionalFeatures = [
  { icon: <PoolIcon />, title: 'Amenity Booking', desc: 'Residents reserve pool, clubhouse, tennis courts, and other amenities online with conflict-free scheduling.' },
  { icon: <AssessmentIcon />, title: 'Financial Reports', desc: 'Income statements, balance sheets, budget-vs-actual, delinquency aging, and reserve fund projections at your fingertips.' },
  { icon: <PeopleIcon />, title: 'Resident Portal', desc: 'Homeowners view their account, pay dues, submit requests, book amenities, and stay informed -- all self-service.' },
  { icon: <DescriptionIcon />, title: 'Document Management', desc: 'Store and share CC&Rs, bylaws, meeting minutes, financial statements, and community docs in a searchable archive.' },
  { icon: <NotificationsActiveIcon />, title: 'Emergency Alerts', desc: 'Send urgent notifications to all residents instantly via email and in-app alerts for weather events, security issues, or emergencies.' },
  { icon: <CreditCardIcon />, title: 'Online Payments', desc: 'Accept ACH and credit card payments. Auto-apply to accounts, send receipts, and reconcile with your ledger automatically.' },
];

const testimonials = [
  {
    quote: 'CommunityVault eliminated our paper-based violation process entirely. What used to take weeks of mailing notices now happens in minutes. Our compliance rate improved by 40% in the first quarter.',
    name: 'Karen S.',
    title: 'HOA President, Oakwood Estates',
  },
  {
    quote: 'Managing finances for 300 units was a nightmare with spreadsheets. Now every assessment, payment, and expense is tracked automatically. Our board finally has real-time visibility into our financial health.',
    name: 'Michael T.',
    title: 'Treasurer, Lakeview Condos',
  },
  {
    quote: 'As a property management company handling 12 communities, the multi-community support is a game-changer. One dashboard, one login, complete oversight. Our staff efficiency doubled.',
    name: 'Jennifer L.',
    title: 'Regional Manager, Apex Property Mgmt',
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for small communities just getting started with digital management.',
    color: GREEN,
    features: ['Up to 25 units', 'Owner & resident directory', 'Basic assessments', 'Work order submissions', 'Announcements', 'Document storage'],
    cta: 'Start Free',
    recommended: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    desc: 'For established HOAs that need full-featured community management tools.',
    color: GREEN,
    features: ['Up to 100 units', 'Violation tracking', 'Online payments', 'Amenity booking', 'Architectural review', 'Financial reports', 'Email support'],
    cta: 'Start Free Trial',
    recommended: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    desc: 'For larger communities or management companies with advanced needs.',
    color: GOLD,
    features: ['Up to 500 units', 'Everything in Starter', 'Budget management', 'Reserve fund tracking', 'Board governance tools', 'Audit log', 'Priority support'],
    cta: 'Start Free Trial',
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For management companies or master-planned communities needing dedicated infrastructure.',
    color: GREEN,
    features: ['Unlimited units', 'Everything in Pro', 'Multi-community dashboard', 'Custom integrations & API', 'Dedicated account manager', 'Training & onboarding', 'SLA guarantee', 'Data migration'],
    cta: 'Contact Us',
    recommended: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollTo = (id) => {
    setDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f0', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <AppBar position="fixed" sx={{ bgcolor: GREEN, boxShadow: '0 1px 12px rgba(0,0,0,0.25)' }}>
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Box component="img" src="/favicon.svg" alt="CommunityVault" sx={{ width: 32, height: 32, mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', flexGrow: 1, fontFamily: '"Georgia", serif', letterSpacing: '-0.01em' }}>
            CommunityVault
          </Typography>
          {isMobile ? (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {navLinks.map((l) => (
                <Typography
                  key={l.label}
                  onClick={() => scrollTo(l.href.slice(1))}
                  sx={{ color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, '&:hover': { color: GOLD } }}
                >
                  {l.label}
                </Typography>
              ))}
              <Button variant="outlined" size="small" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: GOLD, color: GOLD } }}>
                Login
              </Button>
              <Button variant="contained" size="small" onClick={() => navigate('/register')} sx={{ bgcolor: GOLD, color: GREEN, fontWeight: 700, '&:hover': { bgcolor: '#d4b36a' } }}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <List>
            {navLinks.map((l) => (
              <ListItem key={l.label} onClick={() => scrollTo(l.href.slice(1))} sx={{ cursor: 'pointer' }}>
                <ListItemText primary={l.label} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => navigate('/login')} sx={{ color: GREEN, borderColor: GREEN }}>Login</Button>
            <Button variant="contained" fullWidth onClick={() => navigate('/register')} sx={{ bgcolor: GOLD, color: GREEN, fontWeight: 700 }}>Register</Button>
          </Box>
        </Box>
      </Drawer>

      {/* HERO */}
      <Box sx={{
        pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${GREEN} 0%, #2D6A4F 50%, ${GREEN} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(197,162,88,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(197,162,88,0.05) 0%, transparent 60%)',
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Chip label="HOA management, modernized" sx={{ mb: 3, bgcolor: 'rgba(197,162,88,0.15)', color: GOLD, fontWeight: 600, fontSize: '0.85rem', border: `1px solid rgba(197,162,88,0.3)` }} />
          <Typography variant="h2" sx={{
            fontWeight: 800, color: '#fff', mb: 3, fontFamily: '"Georgia", serif',
            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' }, lineHeight: 1.15,
          }}>
            The modern platform for
            <Box component="span" sx={{ color: GOLD, display: 'block' }}>community management</Box>
          </Typography>
          <Typography variant="h6" sx={{
            color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 700, mx: 'auto',
            fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6,
          }}>
            Whether you manage a single-family HOA, condo association, townhome community, or
            master-planned development -- CommunityVault gives you the tools to manage properties,
            collect dues, enforce rules, and keep your community running smoothly.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained" size="large" onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: GOLD, color: GREEN, fontWeight: 700, px: 4, py: 1.5, fontSize: '1.05rem', '&:hover': { bgcolor: '#d4b36a', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined" size="large" onClick={() => scrollTo('features')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', px: 4, py: 1.5, fontSize: '1.05rem', '&:hover': { borderColor: GOLD, color: GOLD } }}
            >
              See Features
            </Button>
          </Box>
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 }, flexWrap: 'wrap' }}>
            {[
              { val: '50,000+', label: 'Units Managed' },
              { val: '800+', label: 'Communities' },
              { val: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: GOLD, fontWeight: 800, fontSize: '1.6rem', fontFamily: '"Georgia", serif' }}>{s.val}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FEATURES */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 2 }}>
              Everything your community needs
            </Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 650, mx: 'auto', fontSize: '1.1rem' }}>
              From property records to financial management, CommunityVault handles the administrative
              work so your board can focus on building a better community.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {primaryFeatures.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
                <Card sx={{
                  height: '100%', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', borderColor: GOLD },
                  borderRadius: 3,
                }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${GREEN}10`, color: GREEN, mb: 2, '& svg': { fontSize: 26 },
                    }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, mb: 1, fontSize: '1.05rem' }}>{f.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ADDITIONAL FEATURES */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 700, color: GREEN, textAlign: 'center', mb: 5, fontFamily: '"Georgia", serif' }}>
            Plus even more powerful tools
          </Typography>
          <Grid container spacing={2}>
            {additionalFeatures.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
                <Box sx={{ display: 'flex', gap: 2, p: 2.5, borderRadius: 2, transition: 'all 0.2s', '&:hover': { bgcolor: '#f8f7f4' } }}>
                  <Box sx={{ color: GOLD, mt: 0.3, '& svg': { fontSize: 22 } }}>{f.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: GREEN, fontSize: '0.95rem', mb: 0.5 }}>{f.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* BUILT FOR */}
      <Box id="built-for" sx={{ py: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${GREEN} 0%, #2D6A4F 100%)` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', fontFamily: '"Georgia", serif', fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 2 }}>
              Built for every community
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 700, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
              CommunityVault is designed to serve any residential community, no matter the size or structure.
              Our flexible platform adapts to your bylaws, rules, and workflows.
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {[
              { label: 'Single-Family HOAs', icon: <VillaIcon /> },
              { label: 'Condo Associations', icon: <ApartmentIcon /> },
              { label: 'Townhome Communities', icon: <HolidayVillageIcon /> },
              { label: 'Master-Planned Communities', icon: <LocationCityIcon /> },
              { label: 'Co-ops', icon: <BusinessIcon /> },
              { label: 'Property Management Cos.', icon: <CorporateFareIcon /> },
            ].map((org) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={org.label}>
                <Box sx={{
                  textAlign: 'center', p: 3, borderRadius: 3,
                  border: '1px solid rgba(197,162,88,0.2)', transition: 'all 0.3s',
                  '&:hover': { bgcolor: 'rgba(197,162,88,0.08)', borderColor: GOLD },
                }}>
                  <Box sx={{ color: GOLD, mb: 1.5, '& svg': { fontSize: 32 } }}>{org.icon}</Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{org.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PRICING */}
      <Box id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 2 }}>
              Simple, transparent pricing
            </Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 550, mx: 'auto', fontSize: '1.1rem' }}>
              Start free and scale as your community grows. No hidden fees, no long-term contracts.
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {pricingTiers.map((tier) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tier.name}>
                <Card sx={{
                  height: '100%', borderRadius: 3, position: 'relative',
                  border: tier.recommended ? `2px solid ${GOLD}` : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: tier.recommended ? '0 8px 30px rgba(197,162,88,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
                  transform: tier.recommended ? 'scale(1.03)' : 'none',
                  transition: 'all 0.3s', '&:hover': { transform: tier.recommended ? 'scale(1.05)' : 'translateY(-4px)' },
                }}>
                  {tier.recommended && (
                    <Box sx={{ bgcolor: GOLD, color: GREEN, textAlign: 'center', py: 0.5, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1 }}>
                      MOST POPULAR
                    </Box>
                  )}
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography sx={{ fontWeight: 700, color: GREEN, fontSize: '1.1rem', mb: 1 }}>{tier.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: tier.color === GOLD ? GOLD : GREEN, fontSize: '2.5rem', fontFamily: '"Georgia", serif' }}>{tier.price}</Typography>
                      {tier.period && <Typography sx={{ color: 'text.secondary', ml: 0.5, fontSize: '0.95rem' }}>{tier.period}</Typography>}
                    </Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 3, minHeight: 40 }}>{tier.desc}</Typography>
                    <Button
                      variant={tier.recommended ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => navigate('/register')}
                      sx={tier.recommended
                        ? { bgcolor: GOLD, color: GREEN, fontWeight: 700, mb: 3, '&:hover': { bgcolor: '#d4b36a' } }
                        : { color: GREEN, borderColor: GREEN, fontWeight: 600, mb: 3, '&:hover': { borderColor: GOLD, color: GOLD } }
                      }
                    >
                      {tier.cta}
                    </Button>
                    <Divider sx={{ mb: 2 }} />
                    {tier.features.map((feat) => (
                      <Box key={feat} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: GOLD, mt: 0.2 }} />
                        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{feat}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECURITY */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <LockIcon sx={{ fontSize: 48, color: GREEN, mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2 }}>
              Your data, protected
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1.05rem', maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
              We take the security of your community data seriously. CommunityVault is built with
              enterprise-grade security from the ground up.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              { icon: <LockIcon />, title: 'Encrypted at Rest & In Transit', desc: 'All data is encrypted using AES-256 at rest and TLS 1.3 in transit.' },
              { icon: <ShieldIcon />, title: 'Role-Based Permissions', desc: 'Granular access controls ensure residents only see what they should.' },
              { icon: <VerifiedUserIcon />, title: 'SOC 2 Compliant Infrastructure', desc: 'Hosted on SOC 2 Type II certified cloud infrastructure with 99.9% uptime.' },
              { icon: <SecurityIcon />, title: 'Regular Security Audits', desc: 'Continuous monitoring, penetration testing, and vulnerability scanning.' },
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
                <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                  <Box sx={{ color: GOLD, '& svg': { fontSize: 28 } }}>{item.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: GREEN, mb: 0.5 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* TESTIMONIALS */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 2 }}>
              Trusted by communities everywhere
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((t, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{
                  height: '100%', borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <FormatQuoteIcon sx={{ fontSize: 36, color: GOLD, mb: 2, opacity: 0.6 }} />
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.7, mb: 3, fontStyle: 'italic' }}>
                      "{t.quote}"
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: GREEN, width: 40, height: 40, fontSize: '0.9rem' }}>{t.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: GREEN, fontSize: '0.9rem' }}>{t.name}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{t.title}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${GREEN} 0%, #2D6A4F 100%)`,
        textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{
            fontWeight: 800, color: '#fff', fontFamily: '"Georgia", serif',
            fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 2,
          }}>
            Ready to modernize your community?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', mb: 5, maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
            Join hundreds of communities that trust CommunityVault to manage their operations.
            Get started in minutes -- no credit card required.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained" size="large" onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: GOLD, color: GREEN, fontWeight: 700, px: 5, py: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#d4b36a', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined" size="large" onClick={() => scrollTo('pricing')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', px: 5, py: 1.5, fontSize: '1.1rem', '&:hover': { borderColor: GOLD, color: GOLD } }}
            >
              View Pricing
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ bgcolor: '#0a1f14', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box component="img" src="/favicon.svg" alt="CommunityVault" sx={{ width: 28, height: 28 }} />
                <Typography sx={{ fontWeight: 700, color: '#fff', fontFamily: '"Georgia", serif', fontSize: '1.1rem' }}>CommunityVault</Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 300 }}>
                The modern HOA management platform for homeowner associations, condo boards, and property management companies.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ color: GOLD, fontWeight: 600, mb: 2, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Product</Typography>
              {['Features', 'Pricing', 'Security'].map((l) => (
                <Typography key={l} onClick={() => scrollTo(l.toLowerCase())} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 1, cursor: 'pointer', '&:hover': { color: GOLD } }}>{l}</Typography>
              ))}
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ color: GOLD, fontWeight: 600, mb: 2, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Company</Typography>
              {['About', 'Contact', 'Blog'].map((l) => (
                <Typography key={l} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 1, cursor: 'pointer', '&:hover': { color: GOLD } }}>{l}</Typography>
              ))}
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ color: GOLD, fontWeight: 600, mb: 2, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</Typography>
              <Typography onClick={() => navigate('/privacy')} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 1, cursor: 'pointer', '&:hover': { color: GOLD } }}>Privacy Policy</Typography>
              <Typography onClick={() => navigate('/terms')} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mb: 1, cursor: 'pointer', '&:hover': { color: GOLD } }}>Terms of Service</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} CommunityVault. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
