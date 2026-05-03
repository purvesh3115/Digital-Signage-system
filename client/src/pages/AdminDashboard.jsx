import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { Monitor, ListVideo, HardDrive, Bell } from 'lucide-react';
import StatCard from '../components/StatCard';
import SystemStatusChart from '../components/SystemStatusChart';
import DeviceHealth from '../components/DeviceHealth';
import RecentMedia from '../components/RecentMedia';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalDevices: 0,
        onlineDevices: 0,
        activePlaylists: 0,
        storageUsed: 0,
        totalStorage: 1024,
        criticalAlerts: 0,
        health: { healthy: 0, warning: 0, critical: 0 },
        recentMedia: []
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/stats');
                const statsData = response.data;
                
                // Active playlists mapping
                const activePlaylists = statsData.activePlaylists || 0;
                const onlineDevices = statsData.onlineDevices || 0;
                const totalDevices = statsData.totalDevices || 0;
                const recentMedia = statsData.recentMedia || [];

                // Calculate health
                const offlineDevices = (totalDevices || 0) - (onlineDevices || 0);

                setStats({
                    totalDevices: totalDevices || 0,
                    onlineDevices: onlineDevices || 0,
                    activePlaylists: activePlaylists || 0,
                    storageUsed: statsData.storageUsed || 0,
                    totalStorage: 1024,
                    criticalAlerts: offlineDevices,
                    health: {
                        healthy: onlineDevices || 0,
                        warning: 0,
                        critical: offlineDevices
                    },
                    recentMedia: recentMedia || []
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setLoading(false);
            }
        };
        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pulse-loader" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Loading system data...</div>
        </div>
    );

    return (
        <div className="fade-in" style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem' }}>Dashboard Overview</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={24} color="var(--text-secondary)" />
                        <span style={{
                            position: 'absolute', top: -5, right: -5,
                            width: '10px', height: '10px',
                            backgroundColor: 'var(--status-offline)',
                            borderRadius: '50%'
                        }} />
                    </div>
                    <button className="btn" onClick={() => navigate('/media')}>+ New Upload</button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '1.5rem' }}>
                <StatCard
                    title="Total Devices Online"
                    value={`${stats.onlineDevices}/${stats.totalDevices}`}
                    subtext="since last hour"
                    trend={2.1}
                    icon={Monitor}
                    color="79, 70, 229" // Indigo
                />
                <StatCard
                    title="Active Playlists"
                    value={stats.activePlaylists}
                    subtext="from yesterday"
                    trend={-1.0}
                    icon={ListVideo}
                    color="16, 185, 129" // Emerald
                />
                <StatCard
                    title="Storage Usage"
                    value={`${stats.storageUsed}GB`}
                    subtext={`/ ${stats.totalStorage}TB Available`}
                    icon={HardDrive}
                    color="59, 130, 246" // Blue
                />
                <StatCard
                    title="Recent Alerts"
                    value={`${stats.criticalAlerts} Critical`}
                    subtext="View All Alerts"
                    icon={Bell}
                    color="239, 68, 68" // Red
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <SystemStatusChart />
                </div>
                <div>
                    <DeviceHealth stats={stats.health} />
                </div>
            </div>

            {/* Recent Media */}
            <RecentMedia items={stats.recentMedia} />
        </div>
    );
};

export default AdminDashboard;
