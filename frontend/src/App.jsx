import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import { ThemeProvider } from './theme/ThemeContext';
import { SnackbarProvider } from './components/common/SnackbarProvider';

const LandingPage = lazy(() => import('./LandingPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));
const TermsOfService = lazy(() => import('./legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./legal/PrivacyPolicy'));
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const PropertyList = lazy(() => import('./properties/PropertyList'));
const PropertyDetail = lazy(() => import('./properties/PropertyDetail'));
const OwnerList = lazy(() => import('./properties/OwnerList'));
const ResidentList = lazy(() => import('./properties/ResidentList'));
const FinanceDashboard = lazy(() => import('./finances/FinanceDashboard'));
const AssessmentList = lazy(() => import('./finances/AssessmentList'));
const PaymentList = lazy(() => import('./finances/PaymentList'));
const ExpenseList = lazy(() => import('./finances/ExpenseList'));
const BudgetManager = lazy(() => import('./finances/BudgetManager'));
const VendorList = lazy(() => import('./finances/VendorList'));
const ReserveFunds = lazy(() => import('./finances/ReserveFunds'));
const ViolationList = lazy(() => import('./violations/ViolationList'));
const ViolationDetail = lazy(() => import('./violations/ViolationDetail'));
const ViolationTypes = lazy(() => import('./violations/ViolationTypes'));
const WorkOrderList = lazy(() => import('./maintenance/WorkOrderList'));
const WorkOrderDetail = lazy(() => import('./maintenance/WorkOrderDetail'));
const MeetingList = lazy(() => import('./meetings/MeetingList'));
const MeetingDetail = lazy(() => import('./meetings/MeetingDetail'));
const DocumentList = lazy(() => import('./documents/DocumentList'));
const ARBRequestList = lazy(() => import('./architectural/ARBRequestList'));
const ARBRequestDetail = lazy(() => import('./architectural/ARBRequestDetail'));
const AnnouncementList = lazy(() => import('./communications/AnnouncementList'));
const AmenityList = lazy(() => import('./amenities/AmenityList'));
const ReservationForm = lazy(() => import('./amenities/ReservationForm'));
const ReportsDashboard = lazy(() => import('./reports/ReportsDashboard'));
const DelinquencyReport = lazy(() => import('./reports/DelinquencyReport'));
const FinancialReport = lazy(() => import('./reports/FinancialReport'));
const SettingsPage = lazy(() => import('./settings/SettingsPage'));
const UserManagement = lazy(() => import('./admin/UserManagement'));
const AuditLog = lazy(() => import('./admin/AuditLog'));

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress color="primary" />
    </Box>
  );
}

function ProtectedRoute({ children, minRole }) {
  const { user, loading, hasMinRole } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (minRole && !hasMinRole(minRole)) return <Navigate to="/app" replace />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<ProtectedRoute minRole="board_member"><PropertyList /></ProtectedRoute>} />
          <Route path="properties/:id" element={<ProtectedRoute minRole="board_member"><PropertyDetail /></ProtectedRoute>} />
          <Route path="owners" element={<ProtectedRoute minRole="board_member"><OwnerList /></ProtectedRoute>} />
          <Route path="residents" element={<ProtectedRoute minRole="board_member"><ResidentList /></ProtectedRoute>} />
          <Route path="finances" element={<ProtectedRoute minRole="treasurer"><FinanceDashboard /></ProtectedRoute>} />
          <Route path="finances/assessments" element={<ProtectedRoute minRole="treasurer"><AssessmentList /></ProtectedRoute>} />
          <Route path="finances/payments" element={<ProtectedRoute minRole="treasurer"><PaymentList /></ProtectedRoute>} />
          <Route path="finances/expenses" element={<ProtectedRoute minRole="treasurer"><ExpenseList /></ProtectedRoute>} />
          <Route path="finances/budget" element={<ProtectedRoute minRole="treasurer"><BudgetManager /></ProtectedRoute>} />
          <Route path="finances/vendors" element={<ProtectedRoute minRole="treasurer"><VendorList /></ProtectedRoute>} />
          <Route path="finances/reserves" element={<ProtectedRoute minRole="treasurer"><ReserveFunds /></ProtectedRoute>} />
          <Route path="violations" element={<ProtectedRoute minRole="board_member"><ViolationList /></ProtectedRoute>} />
          <Route path="violations/:id" element={<ProtectedRoute minRole="board_member"><ViolationDetail /></ProtectedRoute>} />
          <Route path="violations/types" element={<ProtectedRoute minRole="board_member"><ViolationTypes /></ProtectedRoute>} />
          <Route path="maintenance" element={<WorkOrderList />} />
          <Route path="maintenance/:id" element={<WorkOrderDetail />} />
          <Route path="meetings" element={<ProtectedRoute minRole="board_member"><MeetingList /></ProtectedRoute>} />
          <Route path="meetings/:id" element={<ProtectedRoute minRole="board_member"><MeetingDetail /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute minRole="board_member"><DocumentList /></ProtectedRoute>} />
          <Route path="architectural" element={<ARBRequestList />} />
          <Route path="architectural/:id" element={<ARBRequestDetail />} />
          <Route path="announcements" element={<AnnouncementList />} />
          <Route path="amenities" element={<AmenityList />} />
          <Route path="amenities/:id/reserve" element={<ReservationForm />} />
          <Route path="reports" element={<ProtectedRoute minRole="treasurer"><ReportsDashboard /></ProtectedRoute>} />
          <Route path="reports/delinquency" element={<ProtectedRoute minRole="treasurer"><DelinquencyReport /></ProtectedRoute>} />
          <Route path="reports/financial" element={<ProtectedRoute minRole="treasurer"><FinancialReport /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute minRole="admin"><SettingsPage /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute minRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="admin/audit-log" element={<ProtectedRoute minRole="admin"><AuditLog /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <AuthProvider>
          <CommunityProvider>
            <AppRoutes />
          </CommunityProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
