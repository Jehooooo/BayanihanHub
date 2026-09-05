import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import PendingVerificationPage from '@/features/auth/pages/PendingVerificationPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import BrowsePage from '@/features/items/pages/BrowsePage';
import ItemDetailsPage from '@/features/items/pages/ItemDetailsPage';
import PostItemPage from '@/features/items/pages/PostItemPage';
import RequestsPage from '@/features/requests/pages/RequestsPage';
import SavedItemsPage from '@/features/items/pages/SavedItemsPage';
import RequestItemPage from '@/features/items/pages/RequestItemPage';
import ExchangePage from '@/features/exchange/pages/ExchangePage';
import MessagingPage from '@/features/messaging/pages/MessagingPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import RatingPage from '@/features/ratings/pages/RatingPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import SettingsPage from '@/features/profile/pages/SettingsPage';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import ManageUsersPage from '@/features/admin/pages/ManageUsersPage';
import ManagePostsPage from '@/features/admin/pages/ManagePostsPage';
import ManageRequestsPage from '@/features/admin/pages/ManageRequestsPage';
import ManageReportsPage from '@/features/admin/pages/ManageReportsPage';
import ManageCategoriesPage from '@/features/admin/pages/ManageCategoriesPage';
import ManageApprovalsPage from '@/features/admin/pages/ManageApprovalsPage';
import { useAuthStore } from '@/stores/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated ? (
    <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
  ) : (
    <>{children}</>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  return isAuthenticated && user?.role === 'admin' ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function CatchAllRoute() {
  const { isAuthenticated, user } = useAuthStore();
  return (
    <Navigate
      to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/'}
      replace
    />
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Routes (redirect to dashboard if already authenticated) */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/pending-verification"
          element={
            <PublicOnlyRoute>
              <PendingVerificationPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/registration-submitted"
          element={
            <PublicOnlyRoute>
              <PendingVerificationPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />

        {/* Authenticated User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/:itemId"
          element={
            <ProtectedRoute>
              <RequestItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchanges"
          element={
            <ProtectedRoute>
              <ExchangePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate"
          element={
            <ProtectedRoute>
              <RatingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Panel Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <AdminRoute>
              <ManagePostsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <ManageRequestsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ManageReportsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <ManageCategoriesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <AdminRoute>
              <ManageApprovalsPage />
            </AdminRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </Router>
  );
}
