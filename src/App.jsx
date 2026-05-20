import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OrgDashboard from './pages/organizer/DashboardPage';
import RegisterUmpirePage from './pages/organizer/RegisterUmpirePage';
import InputMatchPage from './pages/organizer/InputMatchPage';
import ScoreboardConfigPage from './pages/organizer/ScoreboardConfigPage';
import MatchResultsPage from './pages/organizer/MatchResultsPage';
import PrintResultsPage from './pages/organizer/PrintResultsPage';
import SelectMatchPage from './pages/umpire/SelectMatchPage';
import MatchHistoryPage from './pages/umpire/MatchHistoryPage';
import LiveScoringPage from './pages/umpire/LiveScoringPage';
import ChangePasswordPage from './pages/shared/ChangePasswordPage';
import './styles/global.css';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'organizer' ? '/organizer' : '/umpire'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Organizer - Blue Theme */}
      <Route path="/organizer" element={
        <ProtectedRoute role="organizer"><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<OrgDashboard />} />
        <Route path="umpires" element={<RegisterUmpirePage />} />
        <Route path="matches/new" element={<InputMatchPage />} />
        <Route path="scoreboard" element={<ScoreboardConfigPage />} />
        <Route path="results" element={<MatchResultsPage />} />
        <Route path="print" element={<PrintResultsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Umpire - Orange Theme */}
      <Route path="/umpire" element={
        <ProtectedRoute role="umpire"><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<SelectMatchPage />} />
        <Route path="history" element={<MatchHistoryPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Live Scoring - Standalone (no dashboard layout) */}
      <Route path="/umpire/match/:id/score" element={
        <ProtectedRoute role="umpire"><LiveScoringPage /></ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
