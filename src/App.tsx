import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Spinner } from './components/ui';

import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import { HomePage } from './pages/public/Home';
import { AboutPage } from './pages/public/About';
import { ServicesPage } from './pages/public/Services';
import { FAQPage } from './pages/public/FAQ';
import { ContactPage } from './pages/public/Contact';

import { SignInPage } from './pages/auth/SignIn';
import { SignUpPage } from './pages/auth/SignUp';
import { ForgotPasswordPage } from './pages/auth/ForgotPassword';
import { AdminLoginPage } from './pages/auth/AdminLogin';

import { DashboardPage } from './pages/dashboard/Dashboard';
import { AIChatPage } from './pages/dashboard/AIChat';
import { SubmitTicketPage } from './pages/dashboard/SubmitTicket';
import { TrackTicketsPage } from './pages/dashboard/TrackTickets';
import { TicketDetailPage } from './pages/dashboard/TicketDetail';
import { ProfilePage } from './pages/dashboard/Profile';
import { NotificationsPage } from './pages/dashboard/Notifications';

import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminTicketsPage } from './pages/admin/AdminTickets';
import { AdminTicketDetailPage } from './pages/admin/AdminTicketDetail';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminReportsPage } from './pages/admin/AdminReports';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (profile && profile.role !== 'admin' && profile.role !== 'technician') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

      {/* Auth pages */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* User dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="chat" element={<AIChatPage />} />
        <Route path="new-ticket" element={<SubmitTicketPage />} />
        <Route path="tickets" element={<TrackTicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin dashboard */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="tickets" element={<AdminTicketsPage />} />
        <Route path="tickets/:id" element={<AdminTicketDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
