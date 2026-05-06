import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { BarChart, PieChart, Activity, RefreshCw } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/analytics');
            const result = response.data;

            const statusDistribution = result.statusDistribution || [];
            const mediaUsage = result.mediaUsage || [];
            const systemLoad = result.systemLoad || [];

            setData({
                statusDistribution,
                mediaUsage,
                systemLoad
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading analytics...</div>;
    if (!data) return <div style={{ padding: '2rem', color: 'var(--status-offline)' }}>Failed to load analytics.</div>;

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem' }}>System Analytics</h1>
                <button className="btn btn-secondary" onClick={fetchAnalytics}>
                    <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                {/* Device Connectivity Pie-Chart (Simple representation) */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <PieChart size={24} color="var(--accent-light)" />
                        <h2>Device Connectivity</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(var(--status-online) ${data.statusDistribution[0].value / (data.statusDistribution[0].value + data.statusDistribution[1].value || 1) * 360}deg, var(--status-offline) 0)` }}>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {data.statusDistribution.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: item.color }}></span>
                                    <span style={{ fontSize: '0.875rem' }}>{item.label}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Media Bar-Chart (Simple representation) */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <BarChart size={24} color="var(--accent-light)" />
                        <h2>Media Popularity (Views)</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.mediaUsage.map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span>{item.name}</span>
                                    <span>{item.views}</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                    <div style={{ height: '100%', width: `${Math.min(item.views * 10, 100)}%`, backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                        {data.mediaUsage.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No usage data available yet.</p>}
                    </div>
                </div>
            </div>

            {/* System Load Activity */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Activity size={24} color="var(--accent-light)" />
                    <h2>Server Resource Usage</h2>
                </div>
                <div style={{ height: '200px', display: 'flex', gap: '1rem', paddingBottom: '2rem' }}>
                    {data.systemLoad.map((item, i) => (
                        <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100%', height: `${item.load}%`, backgroundColor: 'var(--accent-light)', opacity: 0.6, borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
