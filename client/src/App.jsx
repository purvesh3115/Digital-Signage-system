import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import MediaLibrary from './pages/MediaLibrary';
import DeviceManagement from './pages/DeviceManagement';
import Schedules from './pages/Schedules';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Player from './pages/Player';
import SharePlayer from './pages/SharePlayer';
import {
  AccountCreatedPage,
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
  VerificationPage,
} from './pages/AuthFlow';
import './App.css';

const isAuthenticated = () => Boolean(localStorage.getItem('authSession'));

const PublicRoute = ({ children }) => (isAuthenticated() ? <Navigate to="/" replace /> : children);
const ProtectedRoute = ({ children }) => (isAuthenticated() ? children : <Navigate to="/login" replace />);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerificationPage /></PublicRoute>} />
        <Route path="/account-created" element={<PublicRoute><AccountCreatedPage /></PublicRoute>} />

        {/* Player Route - Independent of Admin Layout */}
        <Route path="/play" element={<Player />} />
        <Route path="/share/:token" element={<SharePlayer />} />

        {/* Admin Routes - Wrapped in Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated() ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
