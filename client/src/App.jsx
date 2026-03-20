import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import MediaLibrary from './pages/MediaLibrary';
import DeviceManagement from './pages/DeviceManagement';
import Schedules from './pages/Schedules';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Player from './pages/Player';
import ABTesting from './pages/ABTesting';
import './App.css';

import SharePlayer from './pages/SharePlayer';

function App() {
  return (
    <Router>
      <Routes>
        {/* Player Route - Independent of Admin Layout */}
        <Route path="/play" element={<Player />} />
        <Route path="/share/:token" element={<SharePlayer />} />

        {/* Admin Routes - Wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ab-testing" element={<ABTesting />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
