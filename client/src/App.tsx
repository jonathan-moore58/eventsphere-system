import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './layout/AuthLayout';
import DashboardLayout from './layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OTPVerifyPage from './pages/auth/OTPVerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/auth/ProfilePage';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Booking
import BookingSteps from './pages/booking/BookingSteps';

// Dashboards
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EventAnalyticsPage from './pages/organizer/EventAnalyticsPage';
import CheckInPage from './pages/organizer/CheckInPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e24', color: '#fff' } }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/booking/:eventId" element={<ProtectedRoute />}>
          <Route index element={<BookingSteps />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="attendee" element={<AttendeeDashboard />} />
            <Route 
              path="organizer" 
              element={<ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />}
            >
              <Route index element={<OrganizerDashboard />} />
              <Route path="create" element={<CreateEventPage />} />
              <Route path="events/:id/analytics" element={<EventAnalyticsPage />} />
              <Route path="checkin/:eventId" element={<CheckInPage />} />
            </Route>
            <Route 
              path="admin" 
              element={<ProtectedRoute allowedRoles={['ADMIN']} />}
            >
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
