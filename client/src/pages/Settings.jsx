import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { Settings as SettingsIcon, Shield, Database, Bell, Save, Loader2 } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState({
        systemName: 'SignageAdmin Pro',
        heartbeatInterval: 10,
        cleanupDays: 30,
        notifications: true,
        darkMode: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await apiClient.get('/settings');
                if (response.data && response.data.config) {
                    setConfig(response.data.config);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post('/settings', config);
            alert('Settings saved successfully!');
            window.dispatchEvent(new Event('settingsUpdated')); // Trigger refresh in other components
        } catch (err) {
            console.error(err);
            alert('Failed to save settings: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', icon: SettingsIcon, label: 'General' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'storage', icon: Database, label: 'Storage' },
        { id: 'alerts', icon: Bell, label: 'Notifications' },
    ];

    return (
        <div style={{ maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '2rem' }}>System Settings</h1>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Sidebar Tabs */}
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="card" style={{ flex: 1, padding: '2rem' }}>
                    {activeTab === 'general' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>General Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="label">System Display Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={config.systemName}
                                        onChange={e => setConfig({ ...config, systemName: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>Dark Mode</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Adjust the system interface color.</div>
                                    </div>
                                    <input type="checkbox" checked={config.darkMode} onChange={e => setConfig({ ...config, darkMode: e.target.checked })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Storage & Maintenance</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="label">Auto-Cleanup Old Media (Days)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={config.cleanupDays}
                                        onChange={e => setConfig({ ...config, cleanupDays: e.target.value })}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Files older than this will be automatically archived.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'security' || activeTab === 'alerts') && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                            <SettingsIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>These settings are managed by your global policy.</p>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> : <Save size={18} style={{ marginRight: '0.5rem' }} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
